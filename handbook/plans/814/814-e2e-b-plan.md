# Issue #814, pull request 4 of 8: the second half of the e2e tree (`e2e-b`)

**Planned at:** `origin/main` 029b0557b461587da0fae12bba05b75289be9ed5 (PR #917, pull request 3, merged), Issue #814 comment count 13, the newest 6258681277 (pull request 3's implementer calls, 2026-10-19T02:58:30Z), read with `git ls-remote origin refs/heads/main` and `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate --jq length`, and re-read at 2026-10-19T04:38Z after the cold read's folds, unchanged. Every line number below is the file's own at 029b0557, and every proof's base is 029b0557. No file of this slice's 13 suites changed since 7207cfdd, where the issue-wide plan measured it (`git diff --stat 7207cfdd 029b0557 --` over the 13 suite files and folders prints nothing).
**Governing plan:** `handbook/plans/814/814-plan.md` on main (sha256 32d7dcbfe4d37e82d5a8334c30f52dbd64369581a0a9abc7ccd1c95dd0d61d50), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K3 (Issue #673's construction rules as `node e2e/split-proof.ts <base>` reads them), "Rosters and doctrine, for every pull request", and its calls 1 to 15. Pull request 3's slice plan, `handbook/plans/814/814-e2e-a-plan.md` (sha256 d62078869331e9ac7fa64ea9c96645c462478c009ef1e10824772b2ff341c7c4), is the worked form this one follows: its forms H, K, F and T, its tools, its one commit per family and its CI acceptance. This file is the governing plan's table row 4, label `e2e-b`.
**Rulings:** none new. The ruling that binds this slice is Issue #814 comment 6258530087 (Alex, 2026-10-18, on pull request 3): an oversized kit whose helpers hand back values is split by a small function beside the kit that makes some of its helpers and hands them back, the kit's returned bag unchanged, and "the same shape then applies to the next pull request's two oversized bundles (the reading room's, 60 lines, and the zoom suite's, 61)". Both kits fit that shape as measured below, so this slice brings nothing back to Alex under ruling 2 (comment 6254713941).
**Status:** finished; Open decisions none.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-e2e-b-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

The 35 overruns of 24 files, every one measured at 029b0557 by the lint with this slice's 24 `eslint-suppressions.json` entries deleted (the red, commit 1). Lines of code as the lint counts them (blank lines and comments skipped).

| file | overruns |
|---|---|
| `e2e/suites/print-room/atlas.ts` | `pr20Bind` 96, `pr31Turns` 55, `pr33BackMatter` 52 |
| `e2e/suites/print-room/link.ts` | `prwWarp` 57 |
| `e2e/suites/print-room/plates.ts` | `pr12GrandPoster` 61 |
| `e2e/suites/print-room/print.ts` | `pr21BoundPrint` 62, `pr21bUnboundPrint` 68 |
| `e2e/suites/print-room/redraw.ts` | `pr24cRebind` 58 |
| `e2e/suites/prospect.ts` | `pb2CapitalPlate` 53, `pb3eRoomAndPlate` 73, `pb7YearFilter` 98 (the file 366) |
| `e2e/suites/reading-room/arm.ts` | `rr24BeforeArm` 54 |
| `e2e/suites/reading-room/colophon.ts` | `rr17CounterRead` 58 |
| `e2e/suites/reading-room/kit.ts` | `readingRoomKit` 60 |
| `e2e/suites/render.ts` | `r0ToR4Worker` 63 |
| `e2e/suites/ribbon.ts` | `rb5bTheSlip` 88 |
| `e2e/suites/room-ink.ts` | `rs19Stamp` 52 |
| `e2e/suites/room-voyage-route.ts` | `rv10Handoff` 57, `rv11Seed39` 55 (the file 398) |
| `e2e/suites/runninghead/gallery.ts` | `rh10cPrinted` 56 |
| `e2e/suites/specimen/desktop.ts` | `sb1Boots` 65 |
| `e2e/suites/stage/short.ts` | `ns1Soft` 52, `na4Lean` 66 |
| `e2e/suites/stage/stage.ts` | file 496 |
| `e2e/suites/survey/beat.ts` | `sv2pSwapThenInk` 52, `sv2mStyleInBeat` 72, `sv2oVersoDraw` 62 |
| `e2e/suites/survey/mount.ts` | `sv2iBuildsOnce` 51, `sv2jTurnLanding` 76 |
| `e2e/suites/survey/turn.ts` | `sv10TurnKeepsTrack` 70, `sv2nReducedSwap` 63 |
| `e2e/suites/turn.ts` | `t1StyleTurns` 53 |
| `e2e/suites/zoom/bands.ts` | `z21Hamlets` 52 |
| `e2e/suites/zoom/kit.ts` | `zoomKit` 61 |
| `e2e/suites/zoom/resets.ts` | `z13dRefitHolds` 75 |

Every cut moves whole statements, verbatim but for indentation, into a function the original calls at the same point, or whole groups into a new part file inside the suite's own folder; one function-local type moves to module level so a helper's parameter can name it (form T). Nothing that runs changes: `node e2e/split-proof.ts 029b0557` reads all 57 families `same`, and the four CI lanes print the base's check names. No cut sits under a step `E2E_SKIPS` skips (Tests and guards), so unlike pull request 3's CD25 cut every moved check runs in a lane.

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at 029b0557: 12 STALE claims in its sorted table (one marked blocking, to a reader of the frozen kit wording; the rest cosmetic or for other issues' builders), every number of the dispatch brief CURRENT, and five UNVERIFIABLE (the exact lint counts, since its tree had no dependencies, and the check-name baseline, whose logs it did not fetch, both measured here; the hook body behind the footgun gate's selftest; and the Issue #913 lane's build and tree, which touch no e2e file by its plan). Its ledger is `814-e2e-b-recon-ledger.md` in the scratchpad (sha256 4ad86ab79bfbd0c1f8258028183c5874ffac9db92e78971331784b38eba8c56d). What it changed:

- **The kit wording (its S1, blocking only to a reader of the frozen text).** Issue #673's frozen 3.1 ("inside ONE kit function"; "a kit that would pass 50 lines is two kit functions merged in `run`") is superseded for `readingRoomKit` and `zoomKit` by comment 6258530087: a function beside the kit, the bag unchanged, not a further kit made in `run` (pull request 3 measured that a chain link reads Landfall `DIFF`). Form K below.
- **Pins on what may move** (each kept where it is, the cuts chosen around it): the lint's comment-citation rule (`scripts/lint/comment-citation.ts`, a word match of the cited symbol in the cited file) holds `EA4` in `e2e/suites/stage/stage.ts` (`src/styles/shared/atelier.css` line 580), `waitRedraft` in `e2e/suites/zoom/kit.ts` (`e2e/suites/glass-ceremony.ts` line 59), `prlLink` in `e2e/suites/print-room/link.ts` (`e2e/support/suites.ts` line 80), `RS22` in `e2e/suites/room-ink.ts` and `RH9b` in `e2e/suites/runninghead/heads.ts`; prose holds `NS1` in `e2e/suites/stage/short.ts` (`handbook/specs/ui-design.md` line 250), the `R4` check in `e2e/suites/render.ts` (`handbook/specs/engine-invariants.md` line 84), `LANDED` in `e2e/suites/stage/stage.ts` (the flake record) and the Reading Room's 1440x900 override in `e2e/suites/reading-room.ts` (`handbook/specs/settle-doctrine.md` lines 351 to 360); unit tests import `r0ToR4Worker` (`render.ts`), `readingRoomKit` (`reading-room/kit.ts`, run over a stand-in context in `test/repo/e2e-tiers.test.ts`), `rr0Boots`, `rr14Fallback`, `rv4TiltAndFacing` (`room-voyage-route.ts`, `test/repo/constant-contracts.test.ts`) and `withStyledBoot` (`stage/styled-boot.ts`, `test/e2e/cleanups.test.ts`).
- **Exports other families import**, which stay where their importers find them, since the proof compares a family's outside imports by module path: `CHART_ROOM_FLOOR`, `LANDED` and `rest` from `e2e/suites/stage/stage.ts` (`corners/floor.ts`, `corners/top-row.ts`, `zoom-gestures/touch.ts`); `print-room/print.ts`'s `LENS`, `Lens`, `glideLanded`, `homeCamera`, `midGlideRefit`, `lensRest`, `ZOOM_IN`; `print-room/kit.ts`'s `pressAt` and `clearMetrics`; `print-room/proof.ts`'s `LEGEND_RESEAT` and `reseatKept`. This is the binding constraint on how `stage/stage.ts` is cut (form F below), and prover row C1 shows the proof would read a moved one.
- **`room-voyage-route.ts` stands at 398**, so its two in-file cuts would take it past 400 and the file takes a folder (form F). `rv4TiltAndFacing` stays (the unit test imports it), and so does `rv10Handoff` (the errata row PR #817 names it there).
- **Four e2e lanes**, as pull request 3 found: A runs render, turn, zoom and print-room; B prospect, ribbon, reading-room, room-ink, room-voyage-route, runninghead and stage; C specimen; D survey (`e2e/support/lanes.ts`). Every lane runs a slice suite, so all four are compared (Evidence).
- **Issue #871's and Issue #868's e2e follow-ups are not moved.** SB15's missing flag assertion goes in `sb15OutPress` in `e2e/suites/specimen/gestures.ts`; Z24's and Z25's `ZERO_NUDGE` and `HIDE` live in `e2e/suites/zoom/reads.ts` and are used in `zoom/camera.ts` (`z25ClampFlush`) and `zoom/dress.ts` (`z24CardSeats`); Issue #868's comment adds EA7's comparison in `ea7Scrolled` in `e2e/suites/stage/frame.ts`. None of those four files is in the Files list, so neither follow-up's lines move, and both issues stay open on decisions of Alex's that recon lists.

## Specs

On top of the governing plan's Specs list (its e2e line: `handbook/specs/settle-doctrine.md`, no wait moves out of its step, and `handbook/specs/site-architecture.md`, "How a page is authored"):

- `handbook/specs/site-architecture.md`, the bullet that opens "A suite is one entry file at the top of `e2e/suites/`", in full: "A suite with parts keeps its entry there and puts the parts in a folder of the same name beside it, which the entry imports ...; the entry never moves into its folder, and a part joins no roster ... Suites that belong together share a name prefix and stay flat, each a suite of its own (`e2e/suites/room-ink.ts`, `e2e/suites/room-voyage.ts`)." "Stay flat" is about sibling suites sharing a prefix: `room-voyage-route` stays a suite of its own beside `room-voyage` and `room-ink`, with its entry at the top of `e2e/suites/`, and its new part sits in `e2e/suites/room-voyage-route/`, the folder the first sentence gives a suite with parts. Issue #673's frozen 3.3 is the same rule from the other side ("a single-file suite whose actual split lands over 380 takes a folder too"), and `document-rooms/landmark.ts` (pull request 3) is the precedent.
- `handbook/specs/check-placement.md` "The lint" (the e2e rules these moves cross: `vellum/e2e-throw-inside-step`, `vellum/e2e-console-read-through-drop`, `vellum/e2e-scripts-off-through-helper`, `vellum/e2e-cancellation-roster`, and the comment-citation rule).
- `handbook/specs/conventions.md` "How code is cited" (a cited symbol keeps its file).
- `handbook/specs/engine-invariants.md` line 84 (`R4` in `render.ts`), `handbook/specs/ui-design.md` line 250 (`NS1` in `stage/short.ts`), `handbook/specs/settle-doctrine.md` lines 287 (`clearMetrics` in `print-room/kit.ts`) and 351 to 360 (the Reading Room's own override): each a citation this slice leaves in place.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 2 item 10 (the flake record) for the CI acceptance.

## The design

### The forms a cut takes here

Pull request 3's forms, as its plan defines them, with two added:

- **H, the default.** A contiguous run of whole statements moves into a module-level function declared directly above the function that calls it, called at the point the run stood. The helper takes a bag of exactly the shorthand names it uses, destructured in its signature and typed `Pick<Kit, ...>` on the caller's own kit or context type (Issue #673 pull request 2, rules 6 and 7), and any local of the caller it reads by name, typed with the type that local carries (`Prospect`, `Ribbon`, `Specimen | null`, `Facts`, `string`). A helper that hands values back ends `return <the caller's binding>;`, token for token; an async one is awaited at its call. A helper that holds only checks is a plain function returning `void`, called without `await`, as pull request 3's `cd45FilesNothing` is (`pb3Folio`, `pb7bViewedYear`, `rb5dRoadsOut`, `rh10eLetterFits`, `sb2AtRest`). Every hand-back binds a `const` local to the function that calls the helper, never a `let` of `run` or a binding that outlives its step, so Issue #673 pull request 2 rule 6a (a value handed back across a later throw) bears on none of them. `rs19Read` is called inside the `if` block that is `rs19Stamp`'s one top-level statement, as pull request 3's `p33DragFrom` is called inside a `for` block.
- **K, the two kits, as ruled (comment 6258530087).** A function beside the kit, in the kit's own file and directly above it, declares one of the kit's helpers as it stands and hands it back by name; the kit calls it at the helper's place, `const { <helper> } = <kit stem><Helper>({ evaluate, sleep });`, and the kit's returned bag is unchanged, so every group receives the same kit. The part's bag is typed `Pick<SuiteContext, ...>`, the kit's own `ctx` type, which keeps it clear of the kit's `ReturnType` (measured: `npm run check` exit 0). `readingRoomKit` gives `plateShown` to `readingRoomPlateShown`; `zoomKit` gives `insetView` to `zoomInsetView`, and `waitRedraft` stays in `zoomKit` (cited there).
- **O, an owning sweep (`ns1Soft`, `na4Lean`).** The run is the lists a loop fills and the loop itself. The helper declares them, runs the loop and hands them back; the caller binds them to the same names and, in `na4Lean`, goes on pushing into the lists it was handed back, which are its own values from then on. So no helper writes into a list it was handed (governing call 13; pull request 1's `givingUpLane` is the same shape). `ns1Sweep` hands back `ribbonNav`, a `let` the loop writes, which it now owns; `ns1Soft` reads it once and never writes it.
- **T, a function-local type moved to module level (`rh10cPrinted` only).** `type Fit`, declared inside `rh10cPrinted`, moves verbatim to module level directly above the helper that needs it as a parameter type, `rh10eLetterFits`. Types are stripped before the split proof reads anything, so it reads the family the same; the type checker holds the moved type (prover row S1), and Appendix C's hash pins its bytes.
- **F, a file over 400 lines, or one an in-file cut would take past 395.** Whole groups move to a new part file in the suite's own folder; a part takes what it needs from a sibling by a plain import of an exported name, and the suite file imports the group. Two files take it:
  - **`e2e/suites/stage/stage.ts` (496 to 390)**: the desk windows and folded slips, EA2, EA3, EL1 and EL2, which is the group `eaDesk` with the two helpers only it calls (`foldedShort`, `deskReads`) and the constants only they read (`WINDOWS`, `FOLDED_WINDOWS`, `COLLIDED_2026_10_06` with its comment; lines 29 to 41, 44 and 45, 283 to 377), go to `e2e/suites/stage/desk.ts` (123). `fold` stays, since EA4's `readFixture` calls it too; `REPO`, `SHORT`, `SLIP_TAB_SIBLING`, `type Stage`, `known`, `size` and `fold` gain `export` (lines 15, 42, 47, 56, 186, 224, 260). `CHART_ROOM_FLOOR`, `LANDED`, `rest`, EA4, EA1 and EA5 stay. `e2e/suites/stage.ts` imports `eaDesk` from the new file.
  - **`e2e/suites/room-voyage-route.ts` (398, which its two cuts take to 406, to 362)**: RV7, the full log (`rv7FullLog`, lines 201 to 245), goes to `e2e/suites/room-voyage-route/full-log.ts` (46), where it is exported; the suite file imports it.

The margins are the governing plan's: no file over 395 lines of code, and no function this slice writes or shortens over 48.

### How a cut is chosen (call 2)

A **unit** is one check with its gesture, reads, check calls and dismissal; a gesture with its wait or sleep; a fixture read; or a run of checks on one fixture, the fixture's read with them or not (Issue #673 pull request 3 rule 2; pull request 3's call 2). A cut never splits a unit. For each function, the first of these tiers that fits both functions at 48 or under:

1. one helper holding one unit;
2. one helper holding adjacent whole units;
3. two helpers, each holding one unit.

Within a tier: the fewest names crossing (the helper's parameter names, bag names counted one by one, plus the names it hands back); then the most headroom (the smaller of the two larger functions); then the run that hands nothing back; then the later run. A run at the function's top level is taken before one inside a block, which is used only where no top-level run fits. A run that would take a read as a parameter whose type is written inline at the read is not taken (its parameter would need a new named type). The ranks were computed by `814-e2e-b-cuts.ts` (Appendix B, planning only), whose sizes are predictions; the chosen cuts' sizes below are measured on the dry run, and every runner-up's size is marked predicted.

### Per family

Head sizes measured on the dry run, after `npm run format`, by `814-tests-size.ts` (lines of code). "Call" is the line that replaces the moved run, at its place.

| function (base) | tier, form | moved (base lines) | the new function and its call | head | runner-up, and why it lost |
|---|---|---|---|---|---|
| `pr20Bind` 96 | 3, H | 6 to 23: PR20a's draw, poll and check; 25 to 62: the bind press and the bound poll | `pr20aBindReady({ evaluate, check, sleep }: Pick<SuiteContext, "evaluate" \| "check" \| "sleep">): Promise<void>` 24, call `await pr20aBindReady({ evaluate, check, sleep });`; `pr20Bound({ evaluate, sleep }: Pick<SuiteContext, "evaluate" \| "sleep">)` 41, ending `return bound;`, call `const bound = await pr20Bound({ evaluate, sleep });` | 42 | no single run fits a 96-line function; every other pair takes `bound`, whose type is written inline, as a parameter |
| `pr31Turns` 55 | 1, H | 107 to 129: PR31 | `pr31ThumbTurns({ evaluate, check }: Pick<SuiteContext, "evaluate" \| "check">): Promise<void>` 25; `await pr31ThumbTurns({ evaluate, check });` | 33 | PR31b (130 to 148), same names, 37 predicted |
| `pr33BackMatter` 52 | 1, H | 205 to 216: PR33b | `pr33bBanners({ evaluate, check }: Pick<SuiteContext, "evaluate" \| "check">): Promise<void>` 14; `await pr33bBanners({ evaluate, check });` | 41 | PR33 with its read (164 to 201), 3 names |
| `prwWarp` 57 | 1, H | 63 to 87: PRW2's poll and check | `prw2WarpedProof({ evaluate, check, sleep }: Pick<SuiteContext, "evaluate" \| "check" \| "sleep">): Promise<void>` 31; `await prw2WarpedProof({ evaluate, check, sleep });` | 33 | PRW2's poll alone (63 to 82), same names, hands `warpProof` back, 38 predicted |
| `pr12GrandPoster` 61 | 1, H | 44 to 68: the poster poll | `pr13Poster({ evaluate, sleep }: Pick<SuiteContext, "evaluate" \| "sleep">)` 28, ending `return poster;`; `const poster = await pr13Poster({ evaluate, sleep });` | 37 | the poll with PR13 and PR14 (44 to 87), same names, helper 44 predicted |
| `pr21BoundPrint` 62 | 1, H | 107 to 130: PR21's read and check (the print switch at 106 stays) | `pr21PrintView({ evaluate, check }: Pick<PrintRoomKit, "evaluate" \| "check">): Promise<void>` 26; `await pr21PrintView({ evaluate, check });` | 39 | PR35 (132 to 154), 3 names |
| `pr21bUnboundPrint` 68 | 1, H | 216 to 237: PR21c's paper read and check (the comment, the 816 override and the clear stay) | `pr21cPaperWidth({ evaluate, check }: Pick<SuiteContext, "evaluate" \| "check">): Promise<void>` 24; `await pr21cPaperWidth({ evaluate, check });` | 47 | PR21c with its override and clear (215 to 238), 3 names, 45 predicted |
| `pr24cRebind` 58 | 1, H | 92 to 110: the DECODED comment and the rebound poll | `pr24cRebound({ evaluate, sleep }: Pick<SuiteContext, "evaluate" \| "sleep">)` 21, ending `return rebound;`; `const rebound = await pr24cRebound({ evaluate, sleep });` | 41 | the first bind's press and poll (69 to 83), same names, 44 predicted |
| `pb2CapitalPlate` 53 | 1, H | 103 to 128: PB3, PB3b and PB3c, checks on the capital's read | `pb3Folio({ check }: Pick<ProspectKit, "check">, cap: Prospect): void` 28; `pb3Folio({ check }, cap);` | 28 | PB2 to PB3c (98 to 128), same names, 33 predicted |
| `pb3eRoomAndPlate` 73 | 1, H | 171 to 199: PB3f's key, poll and check, and the home key | `pb3fGlassLeans({ evaluate, check, sleep }: Pick<ProspectKit, "evaluate" \| "check" \| "sleep">): Promise<void>` 35; `await pb3fGlassLeans({ evaluate, check, sleep });` | 45 | PB3e (148 to 170) leaves 51 predicted |
| `pb7YearFilter` 98 | 3, H | 248 to 268: PB7b; 273 to 304: PB7c's poll, the re-engraved read and the check (the submit at 270 to 272 stays) | `pb7bViewedYear({ check }: Pick<ProspectKit, "check">, early: Prospect): void` 23, call `pb7bViewedYear({ check }, early);`; `pb7cReEngraves({ check, sleep, state, svgOf }: Pick<ProspectKit, "check" \| "sleep" \| "state" \| "svgOf">, early: Prospect, standing: string)` 39, ending `return engraved;`, call `const engraved = await pb7cReEngraves({ check, sleep, state, svgOf }, early, standing);` | 47 | the year-300 checks (239 to 268) and PB7d (306 to 331), 10 names to these 9, 44 predicted |
| `readingRoomKit` 60 | K, as ruled | 44 to 61: `plateShown` | `readingRoomPlateShown({ evaluate, sleep }: Pick<SuiteContext, "evaluate" \| "sleep">)` 21, ending `return { plateShown };`; `const { plateShown } = readingRoomPlateShown({ evaluate, sleep });` | 43 | `plateStaysHidden` alone (63 to 76), same names, kit 47 predicted; the two plate reads together, 4 names |
| `rr24BeforeArm` 54 | 1, H | 66 to 76: the pokes and their read | `rr24Poke({ evaluate }: Pick<ReadingRoomKit, "evaluate">)` 14, ending `return poked;`; `const poked = await rr24Poke({ evaluate });` | 44 | the unarmed poll (53 to 65), 3 names |
| `rr17CounterRead` 58 | 1, H | 30 to 51: RR17's press, poll and check | `rr17DrawsTyped({ evaluate, check, sleep }: Pick<ReadingRoomKit, "evaluate" \| "check" \| "sleep">): Promise<void>` 28; `await rr17DrawsTyped({ evaluate, check, sleep });` | 37 | RR17b (52 to 66), same names, 44 predicted |
| `r0ToR4Worker` 63 | 1, H | 65 to 101: the byte-wise comment, the parity read, R2 and R2b | `r2WorkerParity({ evaluate, check }: Pick<SuiteContext, "evaluate" \| "check">): Promise<void>` 38; `await r2WorkerParity({ evaluate, check });` | 28 | the parity read alone (66 to 91), same names and headroom, hands `a2` back; R4 stays (cited) |
| `rb5bTheSlip` 88 | 3, H | 107 to 146: RB5c's lean, poll and check, and the home key; 147 to 159: RB5d | `rb5cLeans({ evaluate, check, sleep }: Pick<RibbonKit, "evaluate" \| "check" \| "sleep">): Promise<void>` 42, call `await rb5cLeans({ evaluate, check, sleep });`; `rb5dRoadsOut({ check }: Pick<RibbonKit, "check">, first: Ribbon): void` 15, call `rb5dRoadsOut({ check }, first);` | 37 | RB5c with RB5e (102 to 106), same names, 45 predicted; one helper over RB5e, RB5c and the home key (102 to 146) passes 48 once its signature breaks |
| `rs19Stamp` 52 | 1, H inside the `if` | 41 to 70: the stamp read | `rs19Read({ evaluate }: Pick<SuiteContext, "evaluate">, sm: Facts)` 33, ending `return rs19;`; `const rs19 = await rs19Read({ evaluate }, sm);` | 23 | the read with its check (41 to 85), same names, 47 predicted |
| `rv10Handoff` 57 | 1, H | 292 to 329: the handoff read | `rv10Read({ evaluate }: Pick<SuiteContext, "evaluate">)` 41, ending `return rv10;`; `const rv10 = await rv10Read({ evaluate });` | 20 | the check (330 to 344) takes `rv10`, typed inline |
| `rv11Seed39` 55 | 1, H | 352 to 391: the seed-39 read | `rv11Read({ evaluate }: Pick<SuiteContext, "evaluate">)` 43, ending `return rv11;`; `const rv11 = await rv11Read({ evaluate });` | 16 | the check (392 to 402) takes `rv11`, typed inline |
| `rh10cPrinted` 56 | 1, H with T | 87 to 96: RH10e; line 54, `type Fit`, to module level | `type Fit = { ... };` then `rh10eLetterFits({ check }: Pick<RunningHeadKit, "check">, gFitLetter: Fit \| null): void` 12; `rh10eLetterFits({ check }, gFitLetter);` | 46 | RH10d (77 to 86), the same names and sizes; the later run is taken |
| `sb1Boots` 65 | 1, H | 18 to 49: SB2 | `sb2AtRest({ check }: Pick<SpecimenKit, "check">, rest: Specimen \| null): void` 34; `sb2AtRest({ check }, rest);` | 34 | SB3 (50 to 69), same names, 46 predicted |
| `ns1Soft` 52 | 1, O | 126 to 170: the four lists and the sweep over rooms and windows | `ns1Sweep(ctx: SuiteContext)` 47, ending `return { faults, rows, ribbonNav, discounted };`; `const { faults, rows, ribbonNav, discounted } = await ns1Sweep(ctx);` | 9 | the NS1 check alone (171 to 175), same names, 48 predicted; the painted read inside the loop (150 to 158), 4 names, is inside a block, and a top-level run fits |
| `na4Lean` 66 | 1, O | 183 to 217: the settle, the two lists and the Print Room's sweep | `na4PrintRoomSweep(ctx: SuiteContext)` 38, ending `return { faults, rows };`; `const { faults, rows } = await na4PrintRoomSweep(ctx);` | 32 | the same run with the touch switch (182 to 217), the same names, less headroom |
| `sv2pSwapThenInk` 52 | 1, H | 29 to 57: the swap read | `sv2pRead({ evaluate }: Pick<SuiteContext, "evaluate">)` 32, ending `return sv2p;`; `const sv2p = await sv2pRead({ evaluate });` | 24 | the checks take `sv2p`, typed inline |
| `sv2mStyleInBeat` 72 | 2, H | 96 to 121: the observer, the draw, the turn poll and the beat read | `sv2mStyleChange({ evaluate, sleep }: Pick<SurveyKit, "evaluate" \| "sleep">)` 29, ending `return { turningSeen, sv2m };`; `const { turningSeen, sv2m } = await sv2mStyleChange({ evaluate, sleep });` | 47 | no single unit fits (the largest, the after read, leaves 61 predicted), and no two do (52 at best, predicted); 93 to 121 adds `trackA`, 5 names |
| `sv2oVersoDraw` 62 | 2, H | 184 to 199: the back-face read and the turn back with its sleep | `sv2oBackFace({ evaluate, sleep }: Pick<SurveyKit, "evaluate" \| "sleep">)` 19, ending `return sv2o;`; `const sv2o = await sv2oBackFace({ evaluate, sleep });` | 47 | the read alone leaves 49; 184 to 198 would split the turn back's press from its sleep; the flip and its observer (166 to 181), the same names and headroom, is the earlier run |
| `sv2iBuildsOnce` 51 | 1, H | 81 to 90: the arm gesture | `sv2iArm({ evaluate }: Pick<SurveyKit, "evaluate">): Promise<void>` 12; `await sv2iArm({ evaluate });` | 42 | the read and the check (95 to 121), 2 names |
| `sv2jTurnLanding` 76 | 1, H | 164 to 199: SV2j's read and check | `sv2jOneBuild({ evaluate, check }: Pick<SurveyKit, "evaluate" \| "check">): Promise<void>` 38; `await sv2jOneBuild({ evaluate, check });` | 41 | the beat with the read and check (163 to 199), 3 names |
| `sv10TurnKeepsTrack` 70 | 1, H | 57 to 101: the read, SV10 and SV2l with SV2l's comment | `sv10TrackSurvives({ evaluate, check }: Pick<SurveyKit, "evaluate" \| "check">): Promise<void>` 46; `await sv10TrackSurvives({ evaluate, check });` | 27 | the read alone (57 to 79), the same names, 48 predicted |
| `sv2nReducedSwap` 63 | 1, H | 133 to 152: the swap read | `sv2nRead({ evaluate }: Pick<SurveyKit, "evaluate">)` 23, ending `return sv2n;`; `const sv2n = await sv2nRead({ evaluate });` | 44 | the read with the media reset and check (133 to 166), 3 names |
| `t1StyleTurns` 53 | 1, H | 23 to 28: the base draw | `t1BaseDraw({ evaluate }: Pick<SuiteContext, "evaluate">): Promise<void>` 8; `await t1BaseDraw({ evaluate });` | 48 | the turned read (38 to 49), 2 names, 42 predicted |
| `zoomKit` 61 | K, as ruled | 50 to 68: `insetView` | `zoomInsetView({ evaluate }: Pick<SuiteContext, "evaluate">)` 22, ending `return { insetView };`; `const { insetView } = zoomInsetView({ evaluate });` | 43 | `captionMs` with `insetView` (46 to 68), 3 names |
| `z21Hamlets` 52 | 1, H | 192 to 217: the hamlet read | `z21HamletsRead({ evaluate }: Pick<ZoomKit, "evaluate">)` 29, ending `return dom21;`; `const dom21 = await z21HamletsRead({ evaluate });` | 27 | the inset wait (186 to 190), same names, 48 predicted |
| `z13dRefitHolds` 75 | 2, H | 135 to 170: the fold and its read, the unfold and its read, Z13d's hash-write gesture, read and check | `z13dFoldAndNoHash({ evaluate, send, check, sleep }: Pick<SuiteContext, "evaluate" \| "send" \| "check" \| "sleep">)` 43, ending `return { z13d, z13e };`; `const { z13d, z13e } = await z13dFoldAndNoHash({ evaluate, send, check, sleep });` | 41 | no single unit fits (the largest, Z13c's check, is 14 lines), nor two; 130 to 162 and 136 to 170 cut through a unit, and 147 to 184 takes `z13d`, typed inline |

The two file moves (form F) and their head sizes are above. Files at the head (lines of code): `print-room/atlas.ts` 334, `link.ts` 93, `plates.ts` 203, `print.ts` 291, `redraw.ts` 264, `prospect.ts` 387, `reading-room/arm.ts` 134, `colophon.ts` 214, `kit.ts` 74, `render.ts` 349, `ribbon.ts` 211, `room-ink.ts` 185, `room-voyage-route.ts` 362, `room-voyage-route/full-log.ts` 46, `runninghead/gallery.ts` 282, `specimen/desktop.ts` 324, `stage.ts` 37, `stage/short.ts` 240, `stage/stage.ts` 390, `stage/desk.ts` 123, `survey/beat.ts` 222, `mount.ts` 201, `turn.ts` 168, `turn.ts` (the suite) 176, `zoom/bands.ts` 258, `zoom/kit.ts` 68, `zoom/resets.ts` 197.

### Measured on the dry run of the whole slice

The base exported from 029b0557 into a scratch folder (`git archive`, so not a git checkout; the planning tree holds no production code), the slice written there by `814-e2e-b-split.ts` with the prune and the ceilings, then `npm run format` over the whole copy. On it: the red was exactly the 35 errors of commit 1 below; after the families, `npm run check` exit 0; `npm run lint` exit 0 (so `vellum/e2e-throw-inside-step` and the comment-citation rule pass over every cut); `npm run format:check` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` wrote a file byte-identical to `814-prune.ts`'s; the split proof (`814-e2e-a-proof.ts`, `e2e/split-proof.ts`'s own `main` over a tree that is not a git checkout) read `57 families against 029b0557b461587da0fae12bba05b75289be9ed5: 0 differ`, the slice's families at `print-room: 13 -> 13 files`, `prospect: 5 -> 5`, `reading-room: 13 -> 13`, `render: 3 -> 3`, `ribbon: 5 -> 5`, `room-ink: 1 -> 1`, `room-voyage-route: 1 -> 2`, `runninghead: 9 -> 9`, `specimen: 6 -> 6`, `stage: 6 -> 7`, `survey: 8 -> 8`, `turn: 1 -> 1`, `zoom: 10 -> 10`; the whole unit suite gave the same outcome as on an untouched copy of the base (2709 tests, 17 failing in both, `diff` of the two failure lists printing nothing); and the 42 unit files that read the e2e tree (Evidence) passed 370 of 374 in both copies. Every test failing in the copies lists tracked files with git (in the reader set, two in `test/repo/lint-config.test.ts` and two in `test/site/fonts.test.ts`), so none of the e2e readers (`e2e-read-types`, `e2e-steps`, `comment-citation`, `console-support`, `e2e-tiers`, `constant-contracts` and the rest) went unchecked at the head; the git-listing ones are checked by the implementer's per-family run in a git checkout, where the 42 pass 374 of 374 (measured at 029b0557 in the planning tree), and `npm test` passes 2717 of 2717 there. Neither new part file is ignored (`git check-ignore -v e2e/suites/stage/desk.ts e2e/suites/room-voyage-route/full-log.ts` exit 1, so the test "no tracked file sits under a root .gitignore pattern" has nothing to find).

The 18 prover rows (Tests and guards) were each planted on the dry run and read as the table says, the type probe printed `tsc exit 2` with `e2e/suites/runninghead/gallery.ts(48,7): error TS2367`, and the copy read 0 differ again after them.

### Alternatives rejected

- **Moving a cited symbol, or an export another family imports, and re-pointing the citer.** The governing "Citations hold" keeps them, and the governing plan changes no spec line before the close-out; in each case another cut fits.
- **`stage/stage.ts` giving EA5 (`lifted`, `ea5Lift`) and EA1 (`ea1Phone`) instead of the desk group**: together 73 lines, which leaves 423. The contrast group EA4 is the only other group large enough, and the lint holds it in the file. The desk group is the one cut that fits.
- **`stage/stage.ts` giving `fold` with the desk group**: EA4's `readFixture` calls it, so `stage.ts` would import it back from `desk.ts` while `desk.ts` imports from `stage.ts`; exporting it from where it stands moves less.
- **`room-voyage-route.ts` giving a topic of several groups** (RV7 to RV9, the log; or RV11 and RV12, the other worlds): three or more shared names to the one of RV7 alone, which is the single group sharing one name that leaves the most headroom (pull request 3's call 9: "the cut that leaves the most headroom and moves the fewest shared names", read as for `corners/floor.ts`'s FL6). RV10 is named by an errata row there, RV4 is imported by a unit test, and RV11 and RV12 would share `Room` too.
- **`ns1Soft`'s painted read inside its loop** (4 names to the sweep's 5): a run inside a block is taken only where no top-level run fits, so that every call of a helper the split makes stands once in its caller rather than once a pass.
- **A helper that takes a read as a parameter** (the checks after `bound`, `rv10`, `rv11`, `sv2p`, `turned`, `dom21` and the like): each read's type is written inline at the read, so the parameter would need a new named type the base never had; a helper that hands the read back needs none.
- **Typing a kit part on the kit's `ReturnType`** (`Pick<ReadingRoomKit, ...>`): the names it picks come from `ctx`, so `SuiteContext` is the type at their old site, and it keeps the part out of the kit's own return type.
- **Deduplicating the copies the base holds** (`stage/short.ts`'s `channel`, `relative`, `ratio`, `median` and `HIDE_TEXT`, which `stage/stage.ts` also declares; `survey/turn.ts`'s two identical observers): the proof counts helper declarations by name, so a merge reads `function X: 2 -> 1`, and it is a change, not a move.

## Files

Created (3): `e2e/suites/room-voyage-route/full-log.ts`, `e2e/suites/stage/desk.ts`, and `handbook/plans/814/814-e2e-b-plan.md` (this file).

Edited (27): `e2e/suites/print-room/atlas.ts`, `e2e/suites/print-room/link.ts`, `e2e/suites/print-room/plates.ts`, `e2e/suites/print-room/print.ts`, `e2e/suites/print-room/redraw.ts`, `e2e/suites/prospect.ts`, `e2e/suites/reading-room/kit.ts`, `e2e/suites/reading-room/arm.ts`, `e2e/suites/reading-room/colophon.ts`, `e2e/suites/render.ts`, `e2e/suites/ribbon.ts`, `e2e/suites/room-ink.ts`, `e2e/suites/room-voyage-route.ts`, `e2e/suites/runninghead/gallery.ts`, `e2e/suites/specimen/desktop.ts`, `e2e/suites/stage.ts`, `e2e/suites/stage/stage.ts`, `e2e/suites/stage/short.ts`, `e2e/suites/survey/beat.ts`, `e2e/suites/survey/mount.ts`, `e2e/suites/survey/turn.ts`, `e2e/suites/turn.ts`, `e2e/suites/zoom/kit.ts`, `e2e/suites/zoom/bands.ts`, `e2e/suites/zoom/resets.ts`; `eslint-suppressions.json` (24 entries out, 26 left); `test/repo/lint-config.test.ts` (24 `LIST_AT_REFORMAT` lines out, and nothing else). Nothing else: no spec, no errata row, no file under `src/`, `scripts/`, `.claude/` or `test-support/`, no roster.

Exports added: `export` on `REPO`, `SHORT`, `SLIP_TAB_SIBLING`, `type Stage`, `known`, `size` and `fold` (`stage/stage.ts`) and on `rv7FullLog` (in its new file). No helper this slice writes is exported. Appendix A is every range in prose; the family tool (Appendix B) is the exact form.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path; `<base>` is 029b0557b461587da0fae12bba05b75289be9ed5):

- **Reused, unchanged**: `814-prune.ts` (sha256 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032, the governing plan's Appendix B), `814-tests-size.ts` (b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43) and `814-tests-counts.ts` (e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04), both pull request 2's Appendix B, and `814-e2e-a-checknames.ts` (58ac39ba4c1af5791e5b8d889a7ee098476590d448b0118c063bdce54bf8bf85) and `814-e2e-a-proof.ts` (1a273c5fc2c082b68cf1d4e24afe511e7d605cf91cadcb3a45aef0c4678d4cba), pull request 3's Appendix B. Check with `shasum -a 256`; a file missing or different is written again from that appendix.
- **This slice's**, written exactly as Appendix B gives them, the planning copies already in the scratchpad under these names: `814-e2e-b-split.ts` (the family tool), `814-e2e-b-bite.ts` (the prover's rows) and `814-e2e-b-typeprobe.ts` (row S1). `814-e2e-b-cuts.ts` is planning only, for a reviewer to rerun the ranks; the build does not use it. Their sha256 are in Appendix B.

## Commits

Branch `chore/814-size-e2e-b`. Each family commit is: run the family tool for it, `npm run format`, then the checks named, then commit. "The family's files" are the files the table names for it.

**Commit 1: the plan and the red.**

1. Copy this file to `handbook/plans/814/814-e2e-b-plan.md`.
2. `node <scratch>/814-prune.ts <repo> e2e/suites/print-room/atlas.ts e2e/suites/print-room/link.ts e2e/suites/print-room/plates.ts e2e/suites/print-room/print.ts e2e/suites/print-room/redraw.ts e2e/suites/prospect.ts e2e/suites/reading-room/arm.ts e2e/suites/reading-room/colophon.ts e2e/suites/reading-room/kit.ts e2e/suites/render.ts e2e/suites/ribbon.ts e2e/suites/room-ink.ts e2e/suites/room-voyage-route.ts e2e/suites/runninghead/gallery.ts e2e/suites/specimen/desktop.ts e2e/suites/stage/short.ts e2e/suites/stage/stage.ts e2e/suites/survey/beat.ts e2e/suites/survey/mount.ts e2e/suites/survey/turn.ts e2e/suites/turn.ts e2e/suites/zoom/bands.ts e2e/suites/zoom/kit.ts e2e/suites/zoom/resets.ts` prints `24 entries deleted, 26 left`.
3. `node <scratch>/814-e2e-b-split.ts <repo> <base> ceilings` prints `ceilings: written`.
4. `shasum -a 256 eslint-suppressions.json test/repo/lint-config.test.ts` prints Appendix C's two hashes.
5. `npm run lint` exits 1 with exactly these 35 errors and no other (measured): `e2e/suites/print-room/atlas.ts` 5:8 `pr20Bind` (96), 106:8 `pr31Turns` (55), 163:8 `pr33BackMatter` (52); `e2e/suites/print-room/link.ts` 32:8 `prwWarp` (57); `e2e/suites/print-room/plates.ts` 34:8 `pr12GrandPoster` (61); `e2e/suites/print-room/print.ts` 105:8 `pr21BoundPrint` (62), 171:8 `pr21bUnboundPrint` (68); `e2e/suites/print-room/redraw.ts` 67:8 `pr24cRebind` (58); `e2e/suites/prospect.ts` 93:1 `pb2CapitalPlate` (53), 147:1 `pb3eRoomAndPlate` (73), 233:1 `pb7YearFilter` (98); `e2e/suites/reading-room/arm.ts` 40:8 `rr24BeforeArm` (54); `e2e/suites/reading-room/colophon.ts` 23:8 `rr17CounterRead` (58); `e2e/suites/reading-room/kit.ts` 17:8 `readingRoomKit` (60); `e2e/suites/render.ts` 56:8 `r0ToR4Worker` (63); `e2e/suites/ribbon.ts` 73:1 `rb5bTheSlip` (88); `e2e/suites/room-ink.ts` 38:1 `rs19Stamp` (52); `e2e/suites/room-voyage-route.ts` 291:1 `rv10Handoff` (57), 349:1 `rv11Seed39` (55); `e2e/suites/runninghead/gallery.ts` 41:8 `rh10cPrinted` (56); `e2e/suites/specimen/desktop.ts` 7:8 `sb1Boots` (65); `e2e/suites/stage/short.ts` 124:8 `ns1Soft` (52), 181:8 `na4Lean` (66); `e2e/suites/stage/stage.ts` 433:1 `max-lines` (496); `e2e/suites/survey/beat.ts` 28:8 `sv2pSwapThenInk` (52), 83:8 `sv2mStyleInBeat` (72), 156:8 `sv2oVersoDraw` (62); `e2e/suites/survey/mount.ts` 72:8 `sv2iBuildsOnce` (51), 124:8 `sv2jTurnLanding` (76); `e2e/suites/survey/turn.ts` 31:8 `sv10TurnKeepsTrack` (70), 104:8 `sv2nReducedSwap` (63); `e2e/suites/turn.ts` 15:1 `t1StyleTurns` (53); `e2e/suites/zoom/bands.ts` 179:8 `z21Hamlets` (52); `e2e/suites/zoom/kit.ts` 6:8 `zoomKit` (61); `e2e/suites/zoom/resets.ts` 122:8 `z13dRefitHolds` (75). The last line reads `35 problems (35 errors, 0 warnings)`.
6. `npm test -- test/repo/lint-config.test.ts` passes, 4 of 4. (Two of its four list tracked files with git, so the planning copy could run only the other two; those passed on the pruned list. Pull requests 2 and 3, the same kind of edit at their commit 1, measured 4 of 4.)
7. Before committing, run the 42 reader files (Evidence) with `node <scratch>/814-tests-counts.ts <repo> <the 42, comma-separated>`: it prints exactly `exit 0, tests 374, pass 374, fail 0` (measured at 029b0557, before the prune; PR #918, the one open pull request touching a reader, changes a comment line of `test/e2e/lane-timings.test.ts` and no test, so a base that includes it prints the same). Any other output is a stop.
8. Commit `#814 The plan, and the lint red on the overruns pull request 4 splits`. Push.

**Commits 2 to 14: one family each, in this order.** For each, with `<family>` and the family's files from the table:

1. `node <scratch>/814-e2e-b-split.ts <repo> <base> <family>` prints `<family>: written`.
2. `npm run format`; then `npm run format:check` passes, and `git status --porcelain` names no file outside the family's files.
3. `node <scratch>/814-tests-size.ts <repo> 40 <the family's files>` prints the head sizes of the Per family table: every file at or under 395 and no function this slice writes or shortens over 48.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 <the family's files>` exits 0.
5. `shasum -a 256 <the family's files>` prints Appendix C's hashes.
6. `node e2e/split-proof.ts <base>` exits 0 and prints `same` on every one of its 57 family lines, the family's own at the file count the table gives, and the summary `57 families against <base>: 0 differ ...`.
7. `node <scratch>/814-tests-counts.ts <repo> <the 42 reader files, comma-separated>` prints `exit 0, tests 374, pass 374, fail 0`.
8. Commit with the message in the table.

| # | family | the family's files | proof line | commit message |
|---|---|---|---|---|
| 2 | `print-room` | `e2e/suites/print-room/atlas.ts`, `e2e/suites/print-room/link.ts`, `e2e/suites/print-room/plates.ts`, `e2e/suites/print-room/print.ts`, `e2e/suites/print-room/redraw.ts` | `same  print-room: 13 -> 13 files` | `#814 The Print Room's long checks call named parts` |
| 3 | `prospect` | `e2e/suites/prospect.ts` | `same  prospect: 5 -> 5 files` | `#814 The Prospect's three long groups call named parts` |
| 4 | `reading-room` | `e2e/suites/reading-room/kit.ts`, `e2e/suites/reading-room/arm.ts`, `e2e/suites/reading-room/colophon.ts` | `same  reading-room: 13 -> 13 files` | `#814 The Reading Room's kit makes its plate read beside it, and two long groups call named parts` |
| 5 | `render` | `e2e/suites/render.ts` | `same  render: 3 -> 3 files` | `#814 The render suite's parity checks take a function of their own` |
| 6 | `ribbon` | `e2e/suites/ribbon.ts` | `same  ribbon: 5 -> 5 files` | `#814 The Ribbon's slip check calls its lean and its roads out` |
| 7 | `room-ink` | `e2e/suites/room-ink.ts` | `same  room-ink: 1 -> 1 files` | `#814 The founding stamp reads in a function of its own` |
| 8 | `room-voyage-route` | `e2e/suites/room-voyage-route.ts`, `e2e/suites/room-voyage-route/full-log.ts` | `same  room-voyage-route: 1 -> 2 files` | `#814 The voyage route's handoff reads take functions of their own, and RV7 takes a file` |
| 9 | `runninghead` | `e2e/suites/runninghead/gallery.ts` | `same  runninghead: 9 -> 9 files` | `#814 The Gallery's printed check names its fit and calls RH10e` |
| 10 | `specimen` | `e2e/suites/specimen/desktop.ts` | `same  specimen: 6 -> 6 files` | `#814 The Specimen's boot check calls SB2` |
| 11 | `stage` | `e2e/suites/stage.ts`, `e2e/suites/stage/stage.ts`, `e2e/suites/stage/desk.ts`, `e2e/suites/stage/short.ts` | `same  stage: 6 -> 7 files` | `#814 The desk windows take a file of their own, and NS1 and NA4 call their sweeps` |
| 12 | `survey` | `e2e/suites/survey/beat.ts`, `e2e/suites/survey/mount.ts`, `e2e/suites/survey/turn.ts` | `same  survey: 8 -> 8 files` | `#814 The survey's long checks call named reads and gestures` |
| 13 | `turn` | `e2e/suites/turn.ts` | `same  turn: 1 -> 1 files` | `#814 The style turn's base draw takes a function of its own` |
| 14 | `zoom` | `e2e/suites/zoom/kit.ts`, `e2e/suites/zoom/bands.ts`, `e2e/suites/zoom/resets.ts` | `same  zoom: 10 -> 10 files` | `#814 The zoom kit makes its inset read beside it, and two long checks call named parts` |

After commit 14, `npm run lint` exits 0. Commits 4 and 14 build the two kits' parts as Alex ruled for `stageKit` (comment 6258530087), and commit 1's prune deletes all 24 entries, since the slice settles all 35 overruns.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: byte-identical).
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes 2717 of 2717 on a base of 029b0557 (measured at the base in the planning tree; the slice adds and removes no test), then `npm run astro:generate`.
- No e2e suite runs locally (governing call 14): the split proof reads every family the same, and CI runs all four lanes. A family the proof reads as changed is a stop, not a local run.
- The pull request body's closing-reference line is the template's form for an issue a pull request deliberately leaves open, with no closing keyword anywhere beside the number: `Issue: #814, stays open because four more pull requests follow (plan: handbook/plans/814/814-e2e-b-plan.md).` After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences` prints an empty list.
- The body quotes the four lanes' and the three unit shards' job times beside main's run 39194887211 at 029b0557 (lanes A 465 s, B 498, C 472, D 504; shards 189 s, 234, 193; recon's reading of `gh run view 39194887211 --json jobs`).

## Tests and guards

No test is added or strengthened, so no new guard's red is written; the red is commit 1's lint. The guards these moves cross are the split proof (that every moved statement runs in its base order under its base step), the lint's `vellum/e2e-throw-inside-step` (that no thrower leaves its step), `vellum/e2e-console-read-through-drop` and the comment-citation rule, and the type checker (form T, and every bag's and parameter's names).

**`vellum-guard-prover` is owed the split proof over the shapes this slice puts into real code that pull request 3 did not** (Issue #673's frozen plan, section 5), at the head sha, in its own sandbox: a single-file suite gaining a folder; form K on two more kits, one handed a name the kit destructured; a helper called inside an `if` block; form O, the owning sweep, including a swapped hand-back; a group moved whole to a part with exports added beside it; a typed local handed by name; a hand-back bag in a group (not a kit); a check-only helper called without `await`; form T; and a control showing why the three exports other families import stayed. Each row is a one-line mutation of a head file, run alone, after which `node e2e/split-proof.ts <base>` must read the row's family `DIFF` (or `same` where named) and every other family `same`; `node <scratch>/814-e2e-b-bite.ts <sandbox> <base> <sandbox>` runs all of them through `e2e/split-proof.ts`'s own `compareFamilies` and restores each file byte for byte (Appendix B), exiting 0 only when every row reads as below; the prover's ledger quotes its output and the sandbox's head sha. Measured on the dry run, each first line as printed:

| id | shape | file | mutation | expected, first line |
|---|---|---|---|---|
| N1 | a group moved to a single-file suite's new folder (F) | `room-voyage-route/full-log.ts` | in `rv7FullLog`, `rv7.ports + 1` becomes `rv7.ports + 2` | DIFF, `function rv7FullLog diverges at statement 17 of 17 -> 17` |
| N2 | a kit's part (K) | `reading-room/kit.ts` | in `readingRoomPlateShown`'s `plateShown`, `i < 160` becomes `i < 159` | DIFF, `function plateShown diverges at statement 1 of 13 -> 13` |
| N3 | the same, the zoom kit | `zoom/kit.ts` | in `zoomInsetView`'s `insetView`, the payload's `.length,` after `.place-hit")` becomes `.length+1,` | DIFF, `function insetView diverges at statement 1 of 1 -> 1` |
| N4 | a kit's part handed a name not its own | `zoom/kit.ts` | `zoomInsetView({ evaluate })` becomes `zoomInsetView({ evaluate: sleep })` | DIFF, `a call to zoomInsetView, a function the split made, is not read through: zoomInsetView ( { evaluate : sleep } )` |
| N5 | a helper called inside an `if` block | `room-ink.ts` | in `rs19Read`, `wantX:${sm.lateNx}*vb.width` becomes `*vb.height` | DIFF, `function rs19Stamp diverges at statement 15 of 23 -> 23` |
| N6 | the same, an argument not handed by name | `room-ink.ts` | `rs19Read({ evaluate }, sm)` becomes `rs19Read({ evaluate }, null)` | DIFF, `a call to rs19Read, a function the split made, is not read through: rs19Read ( { evaluate } , null )` |
| N7 | an owning sweep that hands its two lists back swapped (O) | `stage/short.ts` | `na4PrintRoomSweep`'s `return { faults, rows };` becomes `return { faults: rows, rows: faults };` | DIFF, `a call to na4PrintRoomSweep, a function the split made, is not read through: na4PrintRoomSweep ( ctx )` |
| N8 | an owning sweep's body (O) | `stage/short.ts` | in `na4PrintRoomSweep`, `[1024, 1025, 1024, 1025, 1024]` becomes `[1024, 1025, 1024]` | DIFF, `function na4Lean diverges at statement 12 of 40 -> 40` |
| N9 | a group moved whole to a part with exports beside it (F) | `stage/desk.ts` | in `deskReads`, `page === "/explorer/"` becomes `page === "/print-room/"` | DIFF, `function deskReads diverges at statement 20 of 30 -> 30` |
| N10 | an owning sweep that owns a `let` (O) | `stage/short.ts` | in `ns1Sweep`, `let ribbonNav = false;` becomes `= true;` | DIFF, `function ns1Soft diverges at statement 4 of 33 -> 33` |
| N11 | typed locals handed out of order | `prospect.ts` | `pb7cReEngraves(..., early, standing)` becomes `(..., standing, early)` | DIFF, `a call to pb7cReEngraves, a function the split made, is not read through: ...` |
| N12 | a check-only helper called without `await` | `prospect.ts` | in `pb3Folio`, `/once called Haitani/` becomes `/once called Haitan/` | DIFF, `function pb2CapitalPlate diverges at statement 5 of 7 -> 7` |
| N13 | a group's hand-back bag out of order | `survey/beat.ts` | `sv2mStyleChange`'s `return { turningSeen, sv2m };` becomes `return { sv2m, turningSeen };` | DIFF, `a call to sv2mStyleChange, a function the split made, is not read through: sv2mStyleChange ( { evaluate , sleep } )` |
| N14 | a gesture made a helper | `survey/mount.ts` | in `sv2iArm`, `+1500;` becomes `+1400;` | DIFF, `function sv2iBuildsOnce diverges at statement 10 of 24 -> 24` |
| N15 | a check-only helper taking a T-typed parameter | `runninghead/gallery.ts` | in `rh10eLetterFits`, `gFitLetter.clientW === 816` becomes `=== 815` | DIFF, `function rh10cPrinted diverges at statement 10 of 10 -> 10` |
| N16 | a function's first statements made a helper | `turn.ts` | in `t1BaseDraw`, `value="42";document.getElementById("style")` becomes `value="43";...` | DIFF, `function t1StyleTurns diverges at statement 3 of 15 -> 15` |
| S1 | form T, held by the type checker and not the proof | `runninghead/gallery.ts` | `Fit`'s `clientW: number;` becomes `clientW: string;` | proof `same` (types are stripped first), and `node <scratch>/814-e2e-b-typeprobe.ts <sandbox>` prints `tsc exit 2` and `e2e/suites/runninghead/gallery.ts(48,7): error TS2367` (line 48 is in `rh10eLetterFits`) |
| C1 | the control: an export another family imports, moved | `corners/floor.ts` | its import of `CHART_ROOM_FLOOR, LANDED, rest` from `"../stage/stage.ts"` points at `"../stage/desk.ts"` | DIFF on `corners`, `import gone: CHART_ROOM_FLOOR = CHART_ROOM_FLOOR from e2e/suites/stage/stage.ts` |

Form H's other shapes (a read handed back, a check with its gesture, a run of checks on one fixture) are pull request 3's rows M5 to M18, proved there on real code, and the dry run's `same` on every family is their witness here.

**No bite-parity run on the e2e checks**, as pull request 3's call 15 has it: the split proof establishes, for every moved statement and every `check` call among them, that it runs in the base's order under the base's step with the base's inputs, and the four lanes' check-name lists (Evidence) show every check that runs today still runs and passes. **Every moved check runs in a lane**: the steps `E2E_SKIPS` skips in this slice's suites are `RR42` (Issue #869), whose body `rr42PlateReveal` is in `e2e/suites/reading-room/gestures.ts`, and `EA7` and `EA8` (Issue #897), whose bodies `ea7Scrolled` and `ea8Pinched` are in `e2e/suites/stage/frame.ts` (`e2e/support/skips.ts`; `grep -n '"RR42"\|"EA7"\|"EA8"' e2e/suites/reading-room.ts e2e/suites/stage.ts`), and neither file is touched.

## Rosters and doctrine

- **Joined by hand**: nothing. The two new part files are imported by their suite files; `SOURCE_READS` reaches `e2e/**` by glob (`test-support/source-read-list.ts`, the witnesses at lines 19, 22 and 36), and no new file reads source; the lint's e2e block covers `e2e/**/*.ts`; `E2E_SUITE_ORDER`, `E2E_LANES`, `MEASURED_SECONDS`, `NEEDS_PREDECESSOR`, `OPENS_ON_HOME` and `E2E_SKIPS` are keyed by suite name and step id, and no step is renamed, added, removed or reordered (every `step(` line and its string stays on its line, `RR42`, `EA7` and `EA8` among them).
- **Readers held**: `test/repo/e2e-tiers.test.ts` runs `r0ToR4Worker` and `rr0Boots(readingRoomKit(...))` over stand-in pages and they still read the same calls in the same order; `test/repo/constant-contracts.test.ts` runs `rv4TiltAndFacing`, untouched; `test/e2e/cleanups.test.ts` imports `withStyledBoot`, untouched; `test/site/sheet-height.test.ts`'s literals are in no slice file; `test/repo/console-support.test.ts`'s accumulator reads are unchanged (no moved run reads `consoleErrors`).
- **Citations**: every cited symbol stays in its cited file (Recon). The pinned file `stage/stage.ts` keeps `EA4`, `LANDED`, `CHART_ROOM_FLOOR` and `grounds`; `zoom/kit.ts` keeps `waitRedraft`; `render.ts` keeps `R4`.
- **Errata rows this slice leaves pointing at moved or indirected code, each kept as written** (`handbook/errata/README.md`: a row may name a path that later moves; the governing "rows may keep a moved path"; workflow step 15, text a pull request only moves keeps its old owner): `handbook/errata/site.md` line 62 cites `EL2` in `e2e/suites/stage/stage.ts`, which moves to `e2e/suites/stage/desk.ts` with `eaDesk`; `handbook/errata/guards.md` line 165 names the sheet scale in `rv10Handoff`, which now sits in `rv10Read`, the read `rv10Handoff` calls, in the same file and byte for byte; `handbook/errata/guards.md` line 236 names SB2's reads outside every step in `sb1Boots`, which now sit in `sb2AtRest`, which `sb1Boots` calls, still outside every step. Each row's claim holds of what the named function runs. The PR #694 and PR #770 pointers stay until the close-out (governing call 11).
- **Open issues whose text points at code this slice moves, for the dispatcher and not a decision of this slice** (recon section 7; none started): Issue #785 cites the `sleep(700)` calls in `e2e/suites/zoom/resets.ts`, which move into `z13dFoldAndNoHash` in the same file (recon lists its ordering against this slice as a scheduling call for Alex); Issue #899 cites EL1 at `stage/stage.ts:368`, which moves to `e2e/suites/stage/desk.ts`; Issue #434 cites RV7 in `room-voyage-route.ts`, which moves to `e2e/suites/room-voyage-route/full-log.ts`. Each issue's builder re-reads its file when it starts; no issue text is edited here.
- **No spec line changes.** PR #918 (Issue #901, open) edits `handbook/specs/site-architecture.md` and a comment line of `test/e2e/lane-timings.test.ts`; neither is a file this slice touches.

## Evidence

The commands above, in order: commit 1's red; per family the size, lint, hash, split-proof and reader-count checks; the closing checks. The 42 reader files are `test/e2e/browser-policy.test.ts`, `test/e2e/cleanups.test.ts`, `test/e2e/corners.test.ts`, `test/e2e/entry-points.test.ts`, `test/e2e/lane-driver.test.ts`, `test/e2e/lane-timings.test.ts`, `test/e2e/lanes.test.ts`, `test/e2e/launch-harness.test.ts`, `test/e2e/launch.test.ts`, `test/e2e/pace.test.ts`, `test/e2e/ports.test.ts`, `test/e2e/runner.test.ts`, `test/e2e/skips.test.ts`, `test/e2e/slide.test.ts`, `test/e2e/suites-containment.test.ts`, `test/e2e/suites.test.ts`, `test/repo/comment-citation.test.ts`, `test/repo/console-support.test.ts`, `test/repo/constant-contracts.test.ts`, `test/repo/e2e-port-proof.test.ts`, `test/repo/e2e-read-types.test.ts`, `test/repo/e2e-scripts-off.test.ts`, `test/repo/e2e-split-proof-names.test.ts`, `test/repo/e2e-split-proof.test.ts`, `test/repo/e2e-steps.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/repo/footgun-gate.test.ts`, `test/repo/lint-config.test.ts`, `test/repo/lint-wiring.test.ts`, `test/repo/pixel-support.test.ts`, `test/repo/proof-runner-outcome.test.ts`, `test/repo/proof-runner-send.test.ts`, `test/repo/proof-runner-workflow.test.ts`, `test/repo/source-read-guard.test.ts`, `test/repo/source-shape-console.test.ts`, `test/repo/source-shape.test.ts`, `test/repo/step-support.test.ts`, `test/repo/ts-comment-form.test.ts`, `test/site/fonts.test.ts`, `test/site/hunt-zoom.test.ts`, `test/site/print-room-room.test.ts`, `test/site/sheet-height.test.ts`: every test file that names the e2e tree (`git grep -l -E '"\.\./\.\./e2e/|e2e/(suites|support|harness|types|split-proof)|e2eSourcePaths|e2e-source' -- 'test/*.test.ts' 'test/**/*.test.ts'`), with pull request 3's `comment-citation` and the `lint-wiring` witness of `e2e/**`; 374 of 374 at 029b0557 in a git checkout (measured).

**The CI acceptance**: for each lane A to D, the job log of the pull request's CI run and of main's run 39194887211 at 029b0557 (`gh run view --repo ahl-gram/Vellum --job <id> --log > <scratch>/814-e2e-b-<lane>-<base|head>.log`, one command per job; main's job ids are lane A 117875403890, B 117875403797, C 117875403834, D 117875403945), then `node <scratch>/814-e2e-a-checknames.ts <base log> <head log>`, which prints `identical` and exits 0 for each: lane A 268 checks, B 202, C 132, D 161, none failed. Measured on main's two latest runs (39183355190 at 7b053755 against 39194887211 at 029b0557): identical on all four lanes, at those counts, so the names carry no run-dependent value. The four lists go in a PR comment with the command.

`vellum-plate-reader` is not owed: nothing changes an appearance. `vellum-guard-prover` is owed the 18 rows above.

## Calls made (each open to overrule)

1. **One commit per family, written by a tool from base line ranges** (`814-e2e-b-split.ts`). Rule: pull request 3's call 1; pull request 2's call 10.
2. **The cut per function is chosen by the rule in "How a cut is chosen"**: whole units, one helper before two, the fewest names crossing, then the most headroom, then nothing handed back, then the later run, top level before a block, and no read taken as an inline-typed parameter. Rule: pull request 3's call 2 ("a contiguous run of whole statements that is one check, its gesture or a fixture read ... with the fewest names crossing"), pull request 2's call 1 ("the cut that leaves the most headroom and moves the fewest shared names"), Issue #673 pull request 3 rule 2 (a run of checks on one fixture is one group); the tiers and the last tie-breaks are written out so the choice is mechanical, and each runner-up is named in the Per family table.
3. **A helper takes a bag of exactly the shorthand names it uses, typed `Pick<...>` on the caller's kit or context type, and any local by name with that local's own type (form O's two sweeps take the caller's `ctx` by name, as their callers hold it).** Rule: Issue #673 pull request 2 rules 6 and 7; pull request 3's call 3.
4. **The two kits take form K, each giving the one helper that brings it under the bound with the fewest names**: `plateShown` to `readingRoomPlateShown`, `insetView` to `zoomInsetView`, typed on `SuiteContext`. Rule: Alex's ruling (comment 6258530087) for the shape; call 2 for which helper.
5. **`stage/stage.ts` gives the desk group (EA2, EA3, EL1, EL2) to `stage/desk.ts`, and seven names gain `export` there.** Rule: form F; it is the one group that fits that the lint does not hold in place (EA4) and that leaves the three exports other families import where they are (recon; prover row C1).
6. **`room-voyage-route.ts` takes a folder and RV7 moves to `room-voyage-route/full-log.ts`.** Rule: `handbook/specs/site-architecture.md`'s suite-layout bullet and Issue #673's frozen 3.3; within it, pull request 3's call 9 (one group, the fewest shared names, the most headroom), with RV4, RV10, RV11 and RV12 out of the running (a unit test, an errata row, and `Room`).
7. **`ns1Soft` and `na4Lean` take form O, the owning sweep.** Rule: governing call 13 (a helper owns what its loop fills and hands it back); pull request 1's `givingUpLane`; call 2's top level before a block.
8. **`rh10cPrinted`'s `type Fit` moves to module level.** Rule: form H's "typed with the type that local carries", which needs the type at module level; pull request 3's forms C and T moved a declaration and a type out of a function for the same reason.
9. **A helper holding only checks is a plain function returning `void`, called without `await`.** Rule: pull request 3's `cd45FilesNothing`; the lint's `@typescript-eslint/no-floating-promises` refuses an unawaited promise, and a sync function returns none.
10. **The names**, under ruling 1 (they stand unless Alex objects): the files `e2e/suites/stage/desk.ts` and `e2e/suites/room-voyage-route/full-log.ts`; the functions `pr20aBindReady`, `pr20Bound`, `pr31ThumbTurns`, `pr33bBanners`, `prw2WarpedProof`, `pr13Poster`, `pr21PrintView`, `pr21cPaperWidth`, `pr24cRebound`, `pb3Folio`, `pb3fGlassLeans`, `pb7bViewedYear`, `pb7cReEngraves`, `readingRoomPlateShown`, `rr24Poke`, `rr17DrawsTyped`, `r2WorkerParity`, `rb5cLeans`, `rb5dRoadsOut`, `rs19Read`, `rv10Read`, `rv11Read`, `rh10eLetterFits`, `sb2AtRest`, `ns1Sweep`, `na4PrintRoomSweep`, `sv2pRead`, `sv2mStyleChange`, `sv2oBackFace`, `sv2iArm`, `sv2jOneBuild`, `sv10TrackSurvives`, `sv2nRead`, `t1BaseDraw`, `zoomInsetView`, `z21HamletsRead`, `z13dFoldAndNoHash`. A group is named for its first check id and what it checks (Issue #673 call 4), a kit's part for its kit and the helper it holds, a read or sweep for what it reads. Each was checked against every function its base family declares (the proof reads a reused name as a helper, and none collides: the dry run reads every family `same`).
11. **A new part file carries no header.** Rule: Issue #673 call 6; pull request 3's call 11.
12. **Comments travel with the line they lead**: the byte-wise note into `r2WorkerParity`, the DECODED note into `pr24cRebound`, SV2l's `framesBetween` note into `sv10TrackSurvives`, the refit note into `z13dFoldAndNoHash`, the two-rows note into `ns1Sweep`, `COLLIDED_2026_10_06`'s note and `foldedShort`'s into `desk.ts`; `plateStaysHidden`'s note stays above it in the kit, the 900px note stays above PR21c's override, and `fold`'s stays in `stage.ts`. Rule: the governing Specs line; workflow step 15.
13. **No bite-parity run on the e2e checks; the prover runs the 18 proof rows instead.** Rule: the governing table's row 4 names the split proof and the CI lanes as this slice's proof; pull request 3's call 15.
14. **"Both CI lanes" is read as all four, and the acceptance is the check-name lists identical to main's run 39194887211.** Rule: pull request 3's call 17.
15. **The pull request body quotes the four lanes' and three shards' job times.** Rule: pull request 3's call 19.
16. **The three errata rows that name moved or indirected code keep their text.** Rule: `handbook/errata/README.md` and the governing "Citations hold" (rows may keep a moved path).

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, the first draft (sha256 5444657053f3a0327eb0b9193eabfad101b48941ab8f11adec94940ba0b21fb4) and recon's ledger, and nothing else. It rebuilt the slice in a copy of its own at 029b0557 from Appendix B and reproduced every tool hash, the prune, the 35-error red, all 29 Appendix C hashes, `prettier --check`, the lint and `tsc` at the head, the proof's `0 differ` at every file count, 370 of 374 readers with the same four git-listing failures, all 18 rows and the type probe, and every size; it ran 14 attacks (among them a checker probe over all 37 new functions for a name that would bind differently at module level, and one for an early `return`, both empty; the check names against a 2026-10-18 main run, identical on all four lanes); 26 claims checked, 0 wrong. 0 blocking, 0 should-fix, 3 nits, all folded, none rejected:

1. (nit) The plan named Issue #871's and Issue #868's follow-ups but not the open issues whose text points at moved code (Issue #785's sleeps, Issue #899's EL1, Issue #434's RV7). Named in Rosters and doctrine, for the dispatcher, with recon's note that Issue #785's ordering is a scheduling call for Alex.
2. (nit) Rows N7 and N13 planted a reordered bag, which changes nothing at runtime; the real defect of the class is a swapped hand-back. N7 now plants `return { faults: rows, rows: faults };`, re-measured on the dry run (`DIFF`, the line in the table); N13 keeps the reorder, which shows the proof compares the bag token for token.
3. (nit) Call 3 said every helper takes a bag, where form O's sweeps take `ctx` by name. Call 3 now says so.

Written after the cold read, so not read cold: the three folds above and the new N7 row, re-run with the other 17 on the dry run (all as tabled, the copy back to 0 differ after them); and the reader count made exact at commit 1, at every family commit and in the third stop condition (`exit 0, tests 374, pass 374, fail 0`), where the draft let the builder note whatever commit 1 printed as the baseline.

## Open decisions

none. The two oversized kits fit the shape Alex ruled for `stageKit` (comment 6258530087), measured `same` on the dry run; every export another family imports stays where it is; no spec line changes; so this slice meets no question the issue-wide plan and its rulings do not answer (ruling 2, comment 6254713941).

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than the Planned at line's count, read with `gh api repos/ahl-gram/Vellum/issues/814/comments`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`) and your own step 12 record.
- `git diff --stat 029b0557 origin/main -- e2e eslint-suppressions.json test/repo/lint-config.test.ts` prints anything before the first commit.
- Any reader file of Evidence changed between 029b0557 and the branch's base other than `test/e2e/lane-timings.test.ts` by PR #918 (`git diff --stat 029b0557 origin/main -- <the 42>` naming any other file), or the reader run at commit 1 or at any family commit prints anything but `exit 0, tests 374, pass 374, fail 0`.
- A scratch tool's sha256 is not the one given, `814-prune.ts` prints anything but `24 entries deleted, 26 left`, or commit 1's lint red is not exactly the 35 errors listed.
- The family tool throws (an anchor line is not what 029b0557 held), or prints anything but `<family>: written`.
- After `npm run format`, a file's sha256 is not Appendix C's, `npm run format` changes a file outside the family's, a file is over 395 lines of code, or a function this slice writes or shortens is over 48, as `814-tests-size.ts` counts them.
- `node e2e/split-proof.ts <base>` prints a `DIFF` or a `new` line, a family line at another file count than the table's, or any summary but `57 families against <base>: 0 differ ...`, at any commit.
- The per-family `eslint` or, after commit 14, `npm run check` or `npm run lint` fails; the whole `npm test` passes any count but 2717 of 2717.
- The prover reads a row other than the table says, at the head.
- A CI lane's check-name list differs from main's run 39194887211, or a check FAILs. A failed check's payload is first compared with `.claude/skills/vellum-footguns/references/flake-record.md`: a recorded flake gets its row written before any re-run (Gate 2 item 10); any other payload is a hand-back.
- A `check & test` shard's CI job runs longer than 6.0 minutes (its `timeout-minutes: 9` over the `CAP_HEADROOM` of 1.5 in `test/repo/e2e-tiers.test.ts`), or an e2e lane job longer than 10.0 minutes (its `timeout-minutes: 15` over the same 1.5). A pure move changes no wait or budget, so either is a measurement to bring back, not to explain. A shard between 4.8 minutes and 6.0, or a lane between 9.3 and 10.0 (the recorded worsts `test/repo/e2e-tiers.test.ts` carries), is not a stop; the body names it beside the times.

## Appendix A: every range, at 029b0557

The family tool (Appendix B) is the exact form; this is its prose, for review. "Exported" is the line with `export ` added before its first token. Each new function is written with the signature the Per family table gives, directly above the function that calls it (a kit's part directly above the kit), and Prettier lays it out.

- **ceilings.** In `test/repo/lint-config.test.ts`, each line beginning `  "<file>": [` for the 24 files of commit 1 is deleted, and nothing else.
- **print-room.** `atlas.ts`: 1 to 4, `pr20aBindReady` (6 to 23), `pr20Bound` (25 to 62, `return bound;`), line 5, its two calls with line 24 between them, 63 to 105, `pr31ThumbTurns` (107 to 129), 106, its call, 130 to 162, `pr33bBanners` (205 to 216), 163 to 204, its call, 217 to the end. `link.ts`: 1 to 31, `prw2WarpedProof` (63 to 87), 32 to 62, its call, 88 to the end. `plates.ts`: 1 to 33, `pr13Poster` (44 to 68, `return poster;`), 34 to 43, its call, 69 to the end. `print.ts`: 1 to 104, `pr21PrintView` (107 to 130), 105 and 106, its call, 131 to 170, `pr21cPaperWidth` (216 to 237), 171 to 215, its call, 238 to the end. `redraw.ts`: 1 to 66, `pr24cRebound` (92 to 110, `return rebound;`), 67 to 91, its call, 111 to the end.
- **prospect.** `prospect.ts`: 1 to 92, `pb3Folio` (103 to 128), 93 to 102, its call, 129 to 146, `pb3fGlassLeans` (171 to 199), 147 to 170, its call, 200 to 232, `pb7bViewedYear` (248 to 268), `pb7cReEngraves` (273 to 304, `return engraved;`), 233 to 247, the first call, 269 to 272, the second call, 305 to the end.
- **reading-room.** `kit.ts`: 1 to 16, `readingRoomPlateShown` (44 to 61, `return { plateShown };`), 17 to 43, its call, 62 to the end. `arm.ts`: 1 to 39, `rr24Poke` (66 to 76, `return poked;`), 40 to 65, its call, 77 to the end. `colophon.ts`: 1 to 22, `rr17DrawsTyped` (30 to 51), 23 to 29, its call, 52 to the end.
- **render.** `render.ts`: 1 to 55, `r2WorkerParity` (65 to 101), 56 to 64, its call, 102 to the end.
- **ribbon.** `ribbon.ts`: 1 to 72, `rb5cLeans` (107 to 146), `rb5dRoadsOut` (147 to 159), 73 to 106, the two calls, 160 to the end.
- **room-ink.** `room-ink.ts`: 1 to 37, `rs19Read` (41 to 70, `return rs19;`), 38 to 40, its call (inside the `if`), 71 to the end.
- **room-voyage-route.** `room-voyage-route.ts`: 1 to 3, `import { rv7FullLog } from "./room-voyage-route/full-log.ts";`, 4 to 200, 247 to 290, `rv10Read` (292 to 329, `return rv10;`), 291, its call, 330 to 348, `rv11Read` (352 to 391, `return rv11;`), 349 to 351, its call, 392 to the end. `room-voyage-route/full-log.ts`: `import type { SuiteContext } from "../../types.ts";`, a blank line, 201 exported, 202 to 245.
- **runninghead.** `gallery.ts`: 1 to 40, line 54 unindented (`type Fit = ...`), a blank line, `rh10eLetterFits` (87 to 96), 41 to 53, 55 to 86, its call, 97 to the end.
- **specimen.** `desktop.ts`: 1 to 6, `sb2AtRest` (18 to 49), 7 to 17, its call, 50 to the end.
- **stage.** `stage/stage.ts`: 1 to 14, 15 exported, 16 to 28, 42 exported, 43, 46, 47 exported, 48 to 55, 56 exported, 57 to 185, 186 exported, 187 to 223, 224 exported, 225 to 259, 260 exported, 261 to 282, 379 to the end. `stage/desk.ts`: `import { resolve } from "node:path";`, `import type { SuiteContext } from "../../types.ts";`, `import { routesUnder } from "../corners/geometry.ts";`, `import { CHART_ROOM_FLOOR, DESK, fold, known, open, REPO, rest, SHORT, size, SLIP_TAB_SIBLING, stageFaults } from "./stage.ts";`, `import type { Read, Stage } from "./stage.ts";`, a blank line, 29 to 41, 44 and 45, a blank line, 283 to 377. `stage.ts`: 1 to 4, `import { eaDesk } from "./stage/desk.ts";`, 5 and 6, line 7 without `, eaDesk`, 8 to the end. `stage/short.ts`: 1 to 123, `ns1Sweep` (126 to 170, `return { faults, rows, ribbonNav, discounted };`), 124 and 125, its call, 171 to 180, `na4PrintRoomSweep` (183 to 217, `return { faults, rows };`), 181 and 182, its call, 218 to the end.
- **survey.** `beat.ts`: 1 to 27, `sv2pRead` (29 to 57, `return sv2p;`), 28, its call, 58 to 82, `sv2mStyleChange` (96 to 121, `return { turningSeen, sv2m };`), 83 to 95, its call, 122 to 155, `sv2oBackFace` (184 to 199, `return sv2o;`), 156 to 183, its call, 200 to the end. `mount.ts`: 1 to 71, `sv2iArm` (81 to 90), 72 to 80, its call, 91 to 123, `sv2jOneBuild` (164 to 199), 124 to 163, its call, 200 to the end. `turn.ts`: 1 to 30, `sv10TrackSurvives` (57 to 101), 31 to 56, its call, 102 and 103, `sv2nRead` (133 to 152, `return sv2n;`), 104 to 132, its call, 153 to the end.
- **turn.** `turn.ts`: 1 to 14, `t1BaseDraw` (23 to 28), 15 to 22, its call, 29 to the end.
- **zoom.** `kit.ts`: 1 to 5, `zoomInsetView` (50 to 68, `return { insetView };`), 6 to 49, its call, 69 to the end. `bands.ts`: 1 to 178, `z21HamletsRead` (192 to 217, `return dom21;`), 179 to 191, its call, 218 to the end. `resets.ts`: 1 to 121, `z13dFoldAndNoHash` (135 to 170, `return { z13d, z13e };`), 122 to 134, its call, 171 to the end.

## Appendix B: this slice's tools

Written to the scratchpad exactly as below (the planning copies are there already, and `shasum -a 256` must print the hash given). Each loads the repo's own modules by path, so it runs from any directory. The reused `814-prune.ts`, `814-tests-size.ts`, `814-tests-counts.ts`, `814-e2e-a-checknames.ts` and `814-e2e-a-proof.ts` are in the governing plan's, pull request 2's and pull request 3's Appendix B, with the hashes The tools section gives.

### `814-e2e-b-split.ts` (sha256 96b93e6e08b312e90c6378f894694c7b08811576c8a05ffd396111d6b65a541a)

The family tool.

```ts
// usage: [OUT_ROOT=<dir>] node 814-e2e-b-split.ts <repo> <base sha> <family> ...   (reads the base from <repo>'s git, writes into OUT_ROOT, which defaults to <repo>)
// Issue #814 pull request 4: writes one family's head files from the base text by line ranges (1-based, inclusive), before Prettier. Families: ceilings, print-room, prospect, reading-room, render, ribbon, room-ink, room-voyage-route, runninghead, specimen, stage, survey, turn, zoom. A family's files are written only after every anchor of that family has matched; where one is not what the base held it throws and writes none of them.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const [repo, base, ...families] = process.argv.slice(2);
if (repo === undefined || base === undefined || families.length === 0) {
  console.error("usage: node 814-e2e-b-split.ts <repo> <base sha> <family> ...");
  process.exit(2);
}
const at = (p: string): string[] =>
  execFileSync("git", ["show", `${base}:${p}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 }).split("\n");
const outRoot = process.env["OUT_ROOT"] ?? repo;
const pending: [string, string[]][] = [];
const put = (p: string, lines: string[]): void => void pending.push([p, lines]);
const r = (L: string[], a: number, b: number): string[] => L.slice(a - 1, b);
const line = (L: string[], n: number): string => {
  const s = L[n - 1];
  if (s === undefined) throw new Error(`no line ${n}`);
  return s;
};
const exported = (L: string[], n: number): string => line(L, n).replace(/^(\s*)/, "$1export ");
const expect = (f: string, L: string[], checks: readonly (readonly [number, string])[]): void => {
  for (const [n, starts] of checks)
    if (!(L[n - 1] ?? "").trimStart().startsWith(starts))
      throw new Error(`${f} line ${n} is ${JSON.stringify(L[n - 1])}, not ${starts}`);
};
const end = (L: string[]): number => (L.at(-1) === "" ? L.length - 1 : L.length);

const SLICE = [
  "e2e/suites/print-room/atlas.ts",
  "e2e/suites/print-room/link.ts",
  "e2e/suites/print-room/plates.ts",
  "e2e/suites/print-room/print.ts",
  "e2e/suites/print-room/redraw.ts",
  "e2e/suites/prospect.ts",
  "e2e/suites/reading-room/arm.ts",
  "e2e/suites/reading-room/colophon.ts",
  "e2e/suites/reading-room/kit.ts",
  "e2e/suites/render.ts",
  "e2e/suites/ribbon.ts",
  "e2e/suites/room-ink.ts",
  "e2e/suites/room-voyage-route.ts",
  "e2e/suites/runninghead/gallery.ts",
  "e2e/suites/specimen/desktop.ts",
  "e2e/suites/stage/short.ts",
  "e2e/suites/stage/stage.ts",
  "e2e/suites/survey/beat.ts",
  "e2e/suites/survey/mount.ts",
  "e2e/suites/survey/turn.ts",
  "e2e/suites/turn.ts",
  "e2e/suites/zoom/bands.ts",
  "e2e/suites/zoom/kit.ts",
  "e2e/suites/zoom/resets.ts",
];

function ceilings(): void {
  const p = "test/repo/lint-config.test.ts";
  const lines = readFileSync(join(outRoot, p), "utf8").split("\n");
  for (const k of SLICE)
    if (lines.filter((l) => l.startsWith(`  "${k}": [`)).length !== 1) throw new Error(`no single ceiling for ${k}`);
  writeFileSync(join(outRoot, p), lines.filter((l) => !SLICE.some((k) => l.startsWith(`  "${k}": [`))).join("\n"));
}

function printRoom(): void {
  const atlas = "e2e/suites/print-room/atlas.ts";
  const A = at(atlas);
  expect(atlas, A, [
    [4, ""],
    [5, "export async function pr20Bind({ evaluate, check, sleep }: SuiteContext): Promise<void> {"],
    [6, "await evaluate("],
    [23, 'check("PR20a the Bind button enables'],
    [24, ""],
    [25, 'await evaluate(`document.getElementById("pr-bind").click()`);'],
    [26, "let bound = null;"],
    [62, "}"],
    [63, "check("],
    [104, "}"],
    [105, ""],
    [106, "export async function pr31Turns({ evaluate, check }: SuiteContext): Promise<void> {"],
    [107, "const turned = await evaluate<{"],
    [129, ");"],
    [130, "const back = await evaluate<{"],
    [162, ""],
    [163, "export async function pr33BackMatter("],
    [204, ""],
    [205, "const banners = await evaluate<"],
    [216, ");"],
    [217, "}"],
  ]);
  put(atlas, [
    ...r(A, 1, 4),
    'async function pr20aBindReady({ evaluate, check, sleep }: Pick<SuiteContext, "evaluate" | "check" | "sleep">): Promise<void> {',
    ...r(A, 6, 23),
    "}",
    "",
    'async function pr20Bound({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">) {',
    ...r(A, 25, 62),
    "  return bound;",
    "}",
    "",
    ...r(A, 5, 5),
    "  await pr20aBindReady({ evaluate, check, sleep });",
    ...r(A, 24, 24),
    "  const bound = await pr20Bound({ evaluate, sleep });",
    ...r(A, 63, 105),
    'async function pr31ThumbTurns({ evaluate, check }: Pick<SuiteContext, "evaluate" | "check">): Promise<void> {',
    ...r(A, 107, 129),
    "}",
    "",
    ...r(A, 106, 106),
    "  await pr31ThumbTurns({ evaluate, check });",
    ...r(A, 130, 162),
    'async function pr33bBanners({ evaluate, check }: Pick<SuiteContext, "evaluate" | "check">): Promise<void> {',
    ...r(A, 205, 216),
    "}",
    "",
    ...r(A, 163, 204),
    "  await pr33bBanners({ evaluate, check });",
    ...r(A, 217, end(A)),
  ]);

  const link = "e2e/suites/print-room/link.ts";
  const K = at(link);
  expect(link, K, [
    [31, ""],
    [32, "export async function prwWarp({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {"],
    [62, 'await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/${warpHash}` });'],
    [63, "let warpProof = null;"],
    [87, ");"],
    [88, "}"],
  ]);
  put(link, [
    ...r(K, 1, 31),
    'async function prw2WarpedProof({ evaluate, check, sleep }: Pick<SuiteContext, "evaluate" | "check" | "sleep">): Promise<void> {',
    ...r(K, 63, 87),
    "}",
    "",
    ...r(K, 32, 62),
    "  await prw2WarpedProof({ evaluate, check, sleep });",
    ...r(K, 88, end(K)),
  ]);

  const plates = "e2e/suites/print-room/plates.ts";
  const P = at(plates);
  expect(plates, P, [
    [33, ""],
    [34, "export async function pr12GrandPoster({ evaluate, check, sleep }: SuiteContext): Promise<void> {"],
    [43, ""],
    [44, "let poster = null;"],
    [68, "}"],
    [69, "check("],
  ]);
  put(plates, [
    ...r(P, 1, 33),
    'async function pr13Poster({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">) {',
    ...r(P, 44, 68),
    "  return poster;",
    "}",
    "",
    ...r(P, 34, 43),
    "  const poster = await pr13Poster({ evaluate, sleep });",
    ...r(P, 69, end(P)),
  ]);

  const print = "e2e/suites/print-room/print.ts";
  const T = at(print);
  expect(print, T, [
    [104, ""],
    [105, "export async function pr21BoundPrint({ evaluate, send, check, atlasFitAt }: PrintRoomKit): Promise<void> {"],
    [106, 'await send("Emulation.setEmulatedMedia", { media: "print" });'],
    [107, "const printView = await evaluate<{"],
    [130, ");"],
    [131, ""],
    [170, ""],
    [171, "export async function pr21bUnboundPrint({ evaluate, send, check }: SuiteContext): Promise<void> {"],
    [214, "// Paper lays out under the 900px query"],
    [215, 'await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 1056,'],
    [216, "const paper = await evaluate<{"],
    [237, ");"],
    [238, 'await send("Emulation.clearDeviceMetricsOverride");'],
  ]);
  put(print, [
    ...r(T, 1, 104),
    'async function pr21PrintView({ evaluate, check }: Pick<PrintRoomKit, "evaluate" | "check">): Promise<void> {',
    ...r(T, 107, 130),
    "}",
    "",
    ...r(T, 105, 106),
    "  await pr21PrintView({ evaluate, check });",
    ...r(T, 131, 170),
    'async function pr21cPaperWidth({ evaluate, check }: Pick<SuiteContext, "evaluate" | "check">): Promise<void> {',
    ...r(T, 216, 237),
    "}",
    "",
    ...r(T, 171, 215),
    "  await pr21cPaperWidth({ evaluate, check });",
    ...r(T, 238, end(T)),
  ]);

  const redraw = "e2e/suites/print-room/redraw.ts";
  const D = at(redraw);
  expect(redraw, D, [
    [66, ""],
    [67, "export async function pr24cRebind({ evaluate, check, sleep }: SuiteContext): Promise<void> {"],
    [91, ");"],
    [92, "// Poll for the DECODED state"],
    [93, "let rebound = null;"],
    [110, "}"],
    [111, "check("],
  ]);
  put(redraw, [
    ...r(D, 1, 66),
    'async function pr24cRebound({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">) {',
    ...r(D, 92, 110),
    "  return rebound;",
    "}",
    "",
    ...r(D, 67, 91),
    "  const rebound = await pr24cRebound({ evaluate, sleep });",
    ...r(D, 111, end(D)),
  ]);
}

function prospect(): void {
  const f = "e2e/suites/prospect.ts";
  const L = at(f);
  expect(f, L, [
    [7, 'import { prospectKit, type Prospect, type ProspectKit } from "./prospect/kit.ts";'],
    [92, ""],
    [93, "async function pb2CapitalPlate({ send, check, page, opened }: ProspectKit, href: string | null): Promise<void> {"],
    [102, ");"],
    [103, "check("],
    [104, '"PB3 the chart\'s folio names the place'],
    [128, ");"],
    [129, "check("],
    [146, ""],
    [147, "async function pb3eRoomAndPlate({ evaluate, check, sleep, svgOf }: ProspectKit): Promise<string> {"],
    [170, ");"],
    [171, "await evaluate("],
    [199, "}"],
    [200, "check("],
    [232, ""],
    [233, "async function pb7YearFilter({ evaluate, check, sleep, goto, opened, state, svgOf }: ProspectKit): Promise<void> {"],
    [247, ");"],
    [248, "check("],
    [268, ");"],
    [269, ""],
    [270, "await evaluate("],
    [273, "let engraved: Prospect | null = null;"],
    [304, ");"],
    [305, "// Garbage is refused IN PLACE"],
  ]);
  put(f, [
    ...r(L, 1, 92),
    'function pb3Folio({ check }: Pick<ProspectKit, "check">, cap: Prospect): void {',
    ...r(L, 103, 128),
    "}",
    "",
    ...r(L, 93, 102),
    "  pb3Folio({ check }, cap);",
    ...r(L, 129, 146),
    'async function pb3fGlassLeans({ evaluate, check, sleep }: Pick<ProspectKit, "evaluate" | "check" | "sleep">): Promise<void> {',
    ...r(L, 171, 199),
    "}",
    "",
    ...r(L, 147, 170),
    "  await pb3fGlassLeans({ evaluate, check, sleep });",
    ...r(L, 200, 232),
    'function pb7bViewedYear({ check }: Pick<ProspectKit, "check">, early: Prospect): void {',
    ...r(L, 248, 268),
    "}",
    "",
    'async function pb7cReEngraves({ check, sleep, state, svgOf }: Pick<ProspectKit, "check" | "sleep" | "state" | "svgOf">, early: Prospect, standing: string) {',
    ...r(L, 273, 304),
    "  return engraved;",
    "}",
    "",
    ...r(L, 233, 247),
    "  pb7bViewedYear({ check }, early);",
    ...r(L, 269, 272),
    "  const engraved = await pb7cReEngraves({ check, sleep, state, svgOf }, early, standing);",
    ...r(L, 305, end(L)),
  ]);
}

function readingRoom(): void {
  const kit = "e2e/suites/reading-room/kit.ts";
  const K = at(kit);
  expect(kit, K, [
    [15, "export type ReadingRoomKit = ReturnType<typeof readingRoomKit>;"],
    [16, ""],
    [17, "export function readingRoomKit(ctx: SuiteContext) {"],
    [18, "const { evaluate, sleep } = ctx;"],
    [43, "};"],
    [44, "const plateShown = async (hrefTail?: string) => {"],
    [61, "};"],
    [62, "// The NEGATIVE half of the arrival rule"],
    [77, "return { ...ctx, boot, settled, plateShown, plateStaysHidden };"],
  ]);
  put(kit, [
    ...r(K, 1, 16),
    'function readingRoomPlateShown({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">) {',
    ...r(K, 44, 61),
    "  return { plateShown };",
    "}",
    "",
    ...r(K, 17, 43),
    "  const { plateShown } = readingRoomPlateShown({ evaluate, sleep });",
    ...r(K, 62, end(K)),
  ]);

  const arm = "e2e/suites/reading-room/arm.ts";
  const A = at(arm);
  expect(arm, A, [
    [39, ""],
    [40, "export async function rr24BeforeArm({"],
    [65, "}"],
    [66, "const poked = await evaluate<{ before: Ages | null; after: Ages | null; play: string }>(`(()=>{"],
    [76, "})()`);"],
    [77, "const pokeSettled = await settled();"],
  ]);
  put(arm, [
    ...r(A, 1, 39),
    'async function rr24Poke({ evaluate }: Pick<ReadingRoomKit, "evaluate">) {',
    ...r(A, 66, 76),
    "  return poked;",
    "}",
    "",
    ...r(A, 40, 65),
    "  const poked = await rr24Poke({ evaluate });",
    ...r(A, 77, end(A)),
  ]);

  const colophon = "e2e/suites/reading-room/colophon.ts";
  const C = at(colophon);
  expect(colophon, C, [
    [22, ""],
    [23, "export async function rr17CounterRead({"],
    [29, "}: ReadingRoomKit): Promise<void> {"],
    [30, "await evaluate("],
    [51, ");"],
    [52, "let reInked = false;"],
  ]);
  put(colophon, [
    ...r(C, 1, 22),
    'async function rr17DrawsTyped({ evaluate, check, sleep }: Pick<ReadingRoomKit, "evaluate" | "check" | "sleep">): Promise<void> {',
    ...r(C, 30, 51),
    "}",
    "",
    ...r(C, 23, 29),
    "  await rr17DrawsTyped({ evaluate, check, sleep });",
    ...r(C, 52, end(C)),
  ]);
}

function render(): void {
  const f = "e2e/suites/render.ts";
  const L = at(f);
  expect(f, L, [
    [55, ""],
    [56, "export async function r0ToR4Worker({ evaluate, check, waitReady }: SuiteContext): Promise<void> {"],
    [63, 'check("R1 worker active'],
    [64, ""],
    [65, "// The survey land mask is compared byte-wise"],
    [66, "const a2 = await evaluate<{"],
    [101, ");"],
    [102, ""],
    [103, "const a3 = await evaluate<"],
  ]);
  put(f, [
    ...r(L, 1, 55),
    'async function r2WorkerParity({ evaluate, check }: Pick<SuiteContext, "evaluate" | "check">): Promise<void> {',
    ...r(L, 65, 101),
    "}",
    "",
    ...r(L, 56, 64),
    "  await r2WorkerParity({ evaluate, check });",
    ...r(L, 102, end(L)),
  ]);
}

function ribbon(): void {
  const f = "e2e/suites/ribbon.ts";
  const L = at(f);
  expect(f, L, [
    [7, 'import { ribbonKit, type Ribbon, type RibbonKit, type Row } from "./ribbon/kit.ts";'],
    [72, ""],
    [73, "async function rb5bTheSlip({ evaluate, check, sleep }: RibbonKit, first: Ribbon): Promise<void> {"],
    [106, ");"],
    [107, 'await evaluate(`document.querySelectorAll("#rb-itinerary li .lean")[2].click()`);'],
    [146, "}"],
    [147, "check("],
    [148, '"RB5d the roads out'],
    [159, ");"],
    [160, "}"],
  ]);
  put(f, [
    ...r(L, 1, 72),
    'async function rb5cLeans({ evaluate, check, sleep }: Pick<RibbonKit, "evaluate" | "check" | "sleep">): Promise<void> {',
    ...r(L, 107, 146),
    "}",
    "",
    'function rb5dRoadsOut({ check }: Pick<RibbonKit, "check">, first: Ribbon): void {',
    ...r(L, 147, 159),
    "}",
    "",
    ...r(L, 73, 106),
    "  await rb5cLeans({ evaluate, check, sleep });",
    "  rb5dRoadsOut({ check }, first);",
    ...r(L, 160, end(L)),
  ]);
}

function roomInk(): void {
  const f = "e2e/suites/room-ink.ts";
  const L = at(f);
  expect(f, L, [
    [7, "type Facts = Awaited<ReturnType<typeof scrubFacts>>;"],
    [37, ""],
    [38, "async function rs19Stamp({ evaluate, check }: SuiteContext, setYear: Bar[\"setYear\"], sm: Facts): Promise<void> {"],
    [39, "if (sm.lateIdx >= 0) {"],
    [40, "await setYear(sm.lateFounded - 1);"],
    [41, "const rs19 = await evaluate<"],
    [70, "})()`);"],
    [71, "const onPoint ="],
  ]);
  put(f, [
    ...r(L, 1, 37),
    'async function rs19Read({ evaluate }: Pick<SuiteContext, "evaluate">, sm: Facts) {',
    ...r(L, 41, 70),
    "  return rs19;",
    "}",
    "",
    ...r(L, 38, 40),
    "    const rs19 = await rs19Read({ evaluate }, sm);",
    ...r(L, 71, end(L)),
  ]);
}

function roomVoyageRoute(): void {
  const f = "e2e/suites/room-voyage-route.ts";
  const L = at(f);
  expect(f, L, [
    [3, 'import type { SuiteContext } from "../types.ts";'],
    [4, ""],
    [199, "}"],
    [200, ""],
    [201, "async function rv7FullLog({ evaluate, check }: SuiteContext): Promise<void> {"],
    [245, "}"],
    [246, ""],
    [247, "async function rv8LogMode({ evaluate, check }: SuiteContext): Promise<void> {"],
    [290, ""],
    [291, "async function rv10Handoff({ evaluate, check, shoot }: SuiteContext): Promise<void> {"],
    [292, "const rv10 = await evaluate<{"],
    [329, "})()`);"],
    [330, "check("],
    [348, ""],
    [349, "async function rv11Seed39({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {"],
    [351, 'await room.goto("#seed=39&style=antique&legend=1&survey");'],
    [352, "const rv11 = await evaluate<"],
    [391, "})()`);"],
    [392, "check("],
  ]);
  put(f, [
    ...r(L, 1, 3),
    'import { rv7FullLog } from "./room-voyage-route/full-log.ts";',
    ...r(L, 4, 200),
    ...r(L, 247, 290),
    'async function rv10Read({ evaluate }: Pick<SuiteContext, "evaluate">) {',
    ...r(L, 292, 329),
    "  return rv10;",
    "}",
    "",
    ...r(L, 291, 291),
    "  const rv10 = await rv10Read({ evaluate });",
    ...r(L, 330, 348),
    'async function rv11Read({ evaluate }: Pick<SuiteContext, "evaluate">) {',
    ...r(L, 352, 391),
    "  return rv11;",
    "}",
    "",
    ...r(L, 349, 351),
    "  const rv11 = await rv11Read({ evaluate });",
    ...r(L, 392, end(L)),
  ]);
  put("e2e/suites/room-voyage-route/full-log.ts", [
    'import type { SuiteContext } from "../../types.ts";',
    "",
    exported(L, 201),
    ...r(L, 202, 245),
  ]);
}

function runninghead(): void {
  const f = "e2e/suites/runninghead/gallery.ts";
  const L = at(f);
  expect(f, L, [
    [5, 'import type { RunningHeadKit } from "./kit.ts";'],
    [40, ""],
    [41, "export async function rh10cPrinted("],
    [53, ": null;"],
    [54, "type Fit = { scrollW: number; clientW: number; plates: number; maxRight: number; mainPadL: string };"],
    [55, "const FIT_READ: Payload<Fit> ="],
    [86, ");"],
    [87, "check("],
    [88, '"RH10e printed at 816x1056'],
    [96, ");"],
    [97, "}"],
  ]);
  put(f, [
    ...r(L, 1, 40),
    line(L, 54).trimStart(),
    "",
    'function rh10eLetterFits({ check }: Pick<RunningHeadKit, "check">, gFitLetter: Fit | null): void {',
    ...r(L, 87, 96),
    "}",
    "",
    ...r(L, 41, 53),
    ...r(L, 55, 86),
    "  rh10eLetterFits({ check }, gFitLetter);",
    ...r(L, 97, end(L)),
  ]);
}

function specimen(): void {
  const f = "e2e/suites/specimen/desktop.ts";
  const L = at(f);
  expect(f, L, [
    [4, 'import type { Specimen } from "./reads.ts";'],
    [5, 'import type { SpecimenKit } from "./kit.ts";'],
    [6, ""],
    [7, "export async function sb1Boots({ check, shoot }: SpecimenKit, rest: Specimen | null): Promise<void> {"],
    [17, ");"],
    [18, "check("],
    [19, '"SB2 at rest, at 1280'],
    [49, ");"],
    [50, "check("],
  ]);
  put(f, [
    ...r(L, 1, 6),
    'function sb2AtRest({ check }: Pick<SpecimenKit, "check">, rest: Specimen | null): void {',
    ...r(L, 18, 49),
    "}",
    "",
    ...r(L, 7, 17),
    "  sb2AtRest({ check }, rest);",
    ...r(L, 50, end(L)),
  ]);
}

function stage(): void {
  const f = "e2e/suites/stage/stage.ts";
  const L = at(f);
  expect(f, L, [
    [15, "const REPO = resolve("],
    [28, "export const DESK_FRAME_H = 768;"],
    [29, "const WINDOWS: readonly (readonly [number, number])[] = ["],
    [41, "];"],
    [42, "const SHORT = { w: 932, h: 430 };"],
    [43, "export const FLOOR_PLAIN = 4.5;"],
    [44, "// The day's seed on which the Print Room's Press"],
    [45, 'const COLLIDED_2026_10_06 = "/print-room/#seed=20261006";'],
    [46, "// Below 1024 the tab stands on the 1024 page"],
    [47, "const SLIP_TAB_SIBLING = {"],
    [56, "type Stage = {"],
    [186, "const known = (all: readonly string[]): string[] =>"],
    [224, "const size = (ctx: SuiteContext, w: number, h: number): Promise<unknown> =>"],
    [260, "async function fold(ctx: SuiteContext): Promise<void> {"],
    [281, "}"],
    [282, ""],
    [283, "// Folded at 932x430, then resized"],
    [284, "async function foldedShort(ctx: SuiteContext, page: string)"],
    [305, "async function deskReads(ctx: SuiteContext)"],
    [334, "export async function eaDesk(ctx: SuiteContext): Promise<void> {"],
    [377, "}"],
    [378, ""],
    [379, "// A press lifted by hover or keyboard focus"],
  ]);
  put(f, [
    ...r(L, 1, 14),
    exported(L, 15),
    ...r(L, 16, 28),
    exported(L, 42),
    ...r(L, 43, 43),
    ...r(L, 46, 46),
    exported(L, 47),
    ...r(L, 48, 55),
    exported(L, 56),
    ...r(L, 57, 185),
    exported(L, 186),
    ...r(L, 187, 223),
    exported(L, 224),
    ...r(L, 225, 259),
    exported(L, 260),
    ...r(L, 261, 282),
    ...r(L, 379, end(L)),
  ]);
  put("e2e/suites/stage/desk.ts", [
    'import { resolve } from "node:path";',
    'import type { SuiteContext } from "../../types.ts";',
    'import { routesUnder } from "../corners/geometry.ts";',
    'import { CHART_ROOM_FLOOR, DESK, fold, known, open, REPO, rest, SHORT, size, SLIP_TAB_SIBLING, stageFaults } from "./stage.ts";',
    'import type { Read, Stage } from "./stage.ts";',
    "",
    ...r(L, 29, 41),
    ...r(L, 44, 45),
    "",
    ...r(L, 283, 377),
  ]);

  const suite = "e2e/suites/stage.ts";
  const S = at(suite);
  expect(suite, S, [
    [4, 'import type { SuiteContext } from "../types.ts";'],
    [5, 'import { ea6Upright, ea7Scrolled, ea8Pinched, ea9Paper } from "./stage/frame.ts";'],
    [7, 'import { DESK, ea1Phone, ea4Reads, ea5Lift, eaDesk } from "./stage/stage.ts";'],
  ]);
  put(suite, [
    ...r(S, 1, 4),
    'import { eaDesk } from "./stage/desk.ts";',
    ...r(S, 5, 6),
    'import { DESK, ea1Phone, ea4Reads, ea5Lift } from "./stage/stage.ts";',
    ...r(S, 8, end(S)),
  ]);

  const short = "e2e/suites/stage/short.ts";
  const H = at(short);
  expect(short, H, [
    [123, ""],
    [124, "export async function ns1Soft(ctx: SuiteContext): Promise<void> {"],
    [125, "await ctx.setTouch(false);"],
    [126, "const faults: string[] = [];"],
    [128, "let ribbonNav = false;"],
    [129, "const discounted: string[] = [];"],
    [170, "}"],
    [171, "ctx.check("],
    [180, "const REACH_H = 388;"],
    [181, "export async function na4Lean(ctx: SuiteContext): Promise<void> {"],
    [182, "await ctx.setTouch(false);"],
    [183, "const settle = makeSettle(ctx);"],
    [184, "const faults: string[] = [];"],
    [185, "const rows: string[] = [];"],
    [217, "}"],
    [218, "await size(ctx, 1024, REACH_H);"],
  ]);
  put(short, [
    ...r(H, 1, 123),
    "async function ns1Sweep(ctx: SuiteContext) {",
    ...r(H, 126, 170),
    "  return { faults, rows, ribbonNav, discounted };",
    "}",
    "",
    ...r(H, 124, 125),
    "  const { faults, rows, ribbonNav, discounted } = await ns1Sweep(ctx);",
    ...r(H, 171, 180),
    "async function na4PrintRoomSweep(ctx: SuiteContext) {",
    ...r(H, 183, 217),
    "  return { faults, rows };",
    "}",
    "",
    ...r(H, 181, 182),
    "  const { faults, rows } = await na4PrintRoomSweep(ctx);",
    ...r(H, 218, end(H)),
  ]);
}

function survey(): void {
  const beat = "e2e/suites/survey/beat.ts";
  const B = at(beat);
  expect(beat, B, [
    [27, ""],
    [28, "export async function sv2pSwapThenInk({ evaluate, check }: SuiteContext): Promise<void> {"],
    [29, "const sv2p = await evaluate<{"],
    [57, "status:document.getElementById"],
    [58, "check("],
    [82, ""],
    [83, "export async function sv2mStyleInBeat({"],
    [95, ");"],
    [96, "await evaluate(`(()=>{window.__fired=false;"],
    [104, "let turningSeen = false;"],
    [112, "const sv2m = await evaluate<{"],
    [121, "status:document.getElementById"],
    [122, 'await waitTurned("survey-dropped-arm-turn");'],
    [155, ""],
    [156, "export async function sv2oVersoDraw({"],
    [183, 'await waitInked("survey-flipped-ink");'],
    [184, "const sv2o = await evaluate<{"],
    [198, 'await evaluate(`document.getElementById("verso-turn").click()`);'],
    [199, "await sleep(1500);"],
    [200, "check("],
  ]);
  put(beat, [
    ...r(B, 1, 27),
    'async function sv2pRead({ evaluate }: Pick<SuiteContext, "evaluate">) {',
    ...r(B, 29, 57),
    "  return sv2p;",
    "}",
    "",
    ...r(B, 28, 28),
    "  const sv2p = await sv2pRead({ evaluate });",
    ...r(B, 58, 82),
    'async function sv2mStyleChange({ evaluate, sleep }: Pick<SurveyKit, "evaluate" | "sleep">) {',
    ...r(B, 96, 121),
    "  return { turningSeen, sv2m };",
    "}",
    "",
    ...r(B, 83, 95),
    "  const { turningSeen, sv2m } = await sv2mStyleChange({ evaluate, sleep });",
    ...r(B, 122, 155),
    'async function sv2oBackFace({ evaluate, sleep }: Pick<SurveyKit, "evaluate" | "sleep">) {',
    ...r(B, 184, 199),
    "  return sv2o;",
    "}",
    "",
    ...r(B, 156, 183),
    "  const sv2o = await sv2oBackFace({ evaluate, sleep });",
    ...r(B, 200, end(B)),
  ]);

  const mount = "e2e/suites/survey/mount.ts";
  const M = at(mount);
  expect(mount, M, [
    [71, ""],
    [72, "export async function sv2iBuildsOnce({"],
    [80, 'await goto("#seed=42&style=antique", "survey-settle-owns-arm-base");'],
    [81, "await evaluate(`(()=>{"],
    [90, "})()`);"],
    [91, 'await waitSettled("survey-settle-owns-arm-settle");'],
    [123, ""],
    [124, "export async function sv2jTurnLanding({"],
    [163, 'await waitBeat("survey-turn-owns-arm-beat");'],
    [164, "const sv2j = await evaluate<{"],
    [199, ");"],
    [200, "}"],
  ]);
  put(mount, [
    ...r(M, 1, 71),
    'async function sv2iArm({ evaluate }: Pick<SurveyKit, "evaluate">): Promise<void> {',
    ...r(M, 81, 90),
    "}",
    "",
    ...r(M, 72, 80),
    "  await sv2iArm({ evaluate });",
    ...r(M, 91, 123),
    'async function sv2jOneBuild({ evaluate, check }: Pick<SurveyKit, "evaluate" | "check">): Promise<void> {',
    ...r(M, 164, 199),
    "}",
    "",
    ...r(M, 124, 163),
    "  await sv2jOneBuild({ evaluate, check });",
    ...r(M, 200, end(M)),
  ]);

  const turn = "e2e/suites/survey/turn.ts";
  const T = at(turn);
  expect(turn, T, [
    [30, ""],
    [31, "export async function sv10TurnKeepsTrack({"],
    [56, 'await waitInked("survey-turn-rearm");'],
    [57, "const sv10 = await evaluate<{"],
    [101, ");"],
    [102, "}"],
    [103, ""],
    [104, "export async function sv2nReducedSwap({"],
    [132, 'await waitInked("survey-reduce-rearm");'],
    [133, "const sv2n = await evaluate<{"],
    [152, "status:document.getElementById"],
    [153, 'await send("Emulation.setEmulatedMedia", { features: [] });'],
  ]);
  put(turn, [
    ...r(T, 1, 30),
    'async function sv10TrackSurvives({ evaluate, check }: Pick<SurveyKit, "evaluate" | "check">): Promise<void> {',
    ...r(T, 57, 101),
    "}",
    "",
    ...r(T, 31, 56),
    "  await sv10TrackSurvives({ evaluate, check });",
    ...r(T, 102, 103),
    'async function sv2nRead({ evaluate }: Pick<SurveyKit, "evaluate">) {',
    ...r(T, 133, 152),
    "  return sv2n;",
    "}",
    "",
    ...r(T, 104, 132),
    "  const sv2n = await sv2nRead({ evaluate });",
    ...r(T, 153, end(T)),
  ]);
}

function turn(): void {
  const f = "e2e/suites/turn.ts";
  const L = at(f);
  expect(f, L, [
    [14, ""],
    [15, "async function t1StyleTurns({"],
    [22, "}: SuiteContext): Promise<void> {"],
    [23, "await evaluate(`(()=>{"],
    [28, "})()`);"],
    [29, 'await waitSettled("turn-base");'],
  ]);
  put(f, [
    ...r(L, 1, 14),
    'async function t1BaseDraw({ evaluate }: Pick<SuiteContext, "evaluate">): Promise<void> {',
    ...r(L, 23, 28),
    "}",
    "",
    ...r(L, 15, 22),
    "  await t1BaseDraw({ evaluate });",
    ...r(L, 29, end(L)),
  ]);
}

function zoom(): void {
  const kit = "e2e/suites/zoom/kit.ts";
  const K = at(kit);
  expect(kit, K, [
    [4, "export type ZoomKit = ReturnType<typeof zoomKit>;"],
    [5, ""],
    [6, "export function zoomKit(ctx: SuiteContext) {"],
    [7, "const { evaluate, sleep } = ctx;"],
    [49, ");"],
    [50, "const insetView = () =>"],
    [68, ");"],
    [69, "return { ...ctx, waitInked, readRing, rgn, goHome, enterAt, waitRedraft, captionMs, insetView };"],
  ]);
  put(kit, [
    ...r(K, 1, 5),
    'function zoomInsetView({ evaluate }: Pick<SuiteContext, "evaluate">) {',
    ...r(K, 50, 68),
    "  return { insetView };",
    "}",
    "",
    ...r(K, 6, 49),
    "  const { insetView } = zoomInsetView({ evaluate });",
    ...r(K, 69, end(K)),
  ]);

  const bands = "e2e/suites/zoom/bands.ts";
  const B = at(bands);
  expect(bands, B, [
    [178, ""],
    [179, "export async function z21Hamlets("],
    [191, 'await shoot("explorer-hamlets-band3.png");'],
    [192, "const dom21 = await evaluate<{"],
    [217, ");"],
    [218, "check("],
  ]);
  put(bands, [
    ...r(B, 1, 178),
    'async function z21HamletsRead({ evaluate }: Pick<ZoomKit, "evaluate">) {',
    ...r(B, 192, 217),
    "  return dom21;",
    "}",
    "",
    ...r(B, 179, 191),
    "  const dom21 = await z21HamletsRead({ evaluate });",
    ...r(B, 218, end(B)),
  ]);

  const resets = "e2e/suites/zoom/resets.ts";
  const R = at(resets);
  expect(resets, R, [
    [121, ""],
    [122, "export async function z13dRefitHolds({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {"],
    [134, ");"],
    [135, 'await evaluate(`document.querySelector("#broadside .slip-fold").click()`);'],
    [157, "// A refit is camera-side-effect-free"],
    [170, ");"],
    [171, "check("],
  ]);
  put(resets, [
    ...r(R, 1, 121),
    'async function z13dFoldAndNoHash({ evaluate, send, check, sleep }: Pick<SuiteContext, "evaluate" | "send" | "check" | "sleep">) {',
    ...r(R, 135, 170),
    "  return { z13d, z13e };",
    "}",
    "",
    ...r(R, 122, 134),
    "  const { z13d, z13e } = await z13dFoldAndNoHash({ evaluate, send, check, sleep });",
    ...r(R, 171, end(R)),
  ]);
}

const FAMILIES: Record<string, () => void> = {
  ceilings,
  "print-room": printRoom,
  prospect,
  "reading-room": readingRoom,
  render,
  ribbon,
  "room-ink": roomInk,
  "room-voyage-route": roomVoyageRoute,
  runninghead,
  specimen,
  stage,
  survey,
  turn,
  zoom,
};

for (const family of families) {
  const write = FAMILIES[family];
  if (write === undefined) throw new Error(`no family ${family}; the families are ${Object.keys(FAMILIES).join(", ")}`);
  write();
  for (const [p, lines] of pending.splice(0)) {
    mkdirSync(dirname(join(outRoot, p)), { recursive: true });
    writeFileSync(join(outRoot, p), lines.join("\n") + "\n");
  }
  console.log(`${family}: written`);
}
```

### `814-e2e-b-bite.ts` (sha256 76071bc7d65e6353351d2c5e6e0287ae21d8764b5999e11d64e201dbddf907de)

The prover's rows N1 to N16, S1 and C1 (Tests and guards). It runs `814-e2e-a-proof.ts`, pull request 3's, from the same folder.

```ts
// usage: node 814-e2e-b-bite.ts <repo> <base sha> <head root>
// Issue #814 pull request 4: plants each row's one-line mutation in <head root>, runs the split proof (814-e2e-a-proof.ts, beside this file) over it, records the verdict of the row's family and whether any other family moved, and restores the file. Exits non-zero if a row's verdict is not the one it expects or a file is not restored byte for byte.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, base, head] = process.argv.slice(2);
if (repo === undefined || base === undefined || head === undefined) {
  console.error("usage: node 814-e2e-b-bite.ts <repo> <base sha> <head root>");
  process.exit(2);
}
type Row = { id: string; file: string; family: string; find: string; replace: string; expect: "DIFF" | "same" };
const ROWS: Row[] = [
  { id: "N1", file: "e2e/suites/room-voyage-route/full-log.ts", family: "room-voyage-route", find: "rv7.entries === rv7.ports + 1 &&", replace: "rv7.entries === rv7.ports + 2 &&", expect: "DIFF" },
  { id: "N2", file: "e2e/suites/reading-room/kit.ts", family: "reading-room", find: "for (let i = 0; i < 160; i++) {", replace: "for (let i = 0; i < 159; i++) {", expect: "DIFF" },
  { id: "N3", file: "e2e/suites/zoom/kit.ts", family: "zoom", find: '`hits:document.querySelectorAll("#map .place-hit").length,', replace: '`hits:document.querySelectorAll("#map .place-hit").length+1,', expect: "DIFF" },
  { id: "N4", file: "e2e/suites/zoom/kit.ts", family: "zoom", find: "const { insetView } = zoomInsetView({ evaluate });", replace: "const { insetView } = zoomInsetView({ evaluate: sleep });", expect: "DIFF" },
  { id: "N5", file: "e2e/suites/room-ink.ts", family: "room-ink", find: "wantX:${sm.lateNx}*vb.width", replace: "wantX:${sm.lateNx}*vb.height", expect: "DIFF" },
  { id: "N6", file: "e2e/suites/room-ink.ts", family: "room-ink", find: "const rs19 = await rs19Read({ evaluate }, sm);", replace: "const rs19 = await rs19Read({ evaluate }, null);", expect: "DIFF" },
  { id: "N7", file: "e2e/suites/stage/short.ts", family: "stage", find: "  return { faults, rows };", replace: "  return { faults: rows, rows: faults };", expect: "DIFF" },
  { id: "N8", file: "e2e/suites/stage/short.ts", family: "stage", find: "for (const w of [1024, 1025, 1024, 1025, 1024]) {", replace: "for (const w of [1024, 1025, 1024]) {", expect: "DIFF" },
  { id: "N9", file: "e2e/suites/stage/desk.ts", family: "stage", find: 'if (page === "/explorer/") {', replace: 'if (page === "/print-room/") {', expect: "DIFF" },
  { id: "N10", file: "e2e/suites/stage/short.ts", family: "stage", find: "let ribbonNav = false;", replace: "let ribbonNav = true;", expect: "DIFF" },
  { id: "N11", file: "e2e/suites/prospect.ts", family: "prospect", find: "await pb7cReEngraves({ check, sleep, state, svgOf }, early, standing);", replace: "await pb7cReEngraves({ check, sleep, state, svgOf }, standing, early);", expect: "DIFF" },
  { id: "N12", file: "e2e/suites/prospect.ts", family: "prospect", find: "/once called Haitani/", replace: "/once called Haitan/", expect: "DIFF" },
  { id: "N13", file: "e2e/suites/survey/beat.ts", family: "survey", find: "  return { turningSeen, sv2m };", replace: "  return { sv2m, turningSeen };", expect: "DIFF" },
  { id: "N14", file: "e2e/suites/survey/mount.ts", family: "survey", find: "const end=performance.now()+1500;", replace: "const end=performance.now()+1400;", expect: "DIFF" },
  { id: "N15", file: "e2e/suites/runninghead/gallery.ts", family: "runninghead", find: "gFitLetter.clientW === 816 &&", replace: "gFitLetter.clientW === 815 &&", expect: "DIFF" },
  { id: "N16", file: "e2e/suites/turn.ts", family: "turn", find: 'document.getElementById("seed").value="42";document.getElementById("style").value="antique";\n', replace: 'document.getElementById("seed").value="43";document.getElementById("style").value="antique";\n', expect: "DIFF" },
  { id: "S1", file: "e2e/suites/runninghead/gallery.ts", family: "runninghead", find: "type Fit = { scrollW: number; clientW: number;", replace: "type Fit = { scrollW: number; clientW: string;", expect: "same" },
  { id: "C1", file: "e2e/suites/corners/floor.ts", family: "corners", find: 'import { CHART_ROOM_FLOOR, LANDED, rest } from "../stage/stage.ts";', replace: 'import { CHART_ROOM_FLOOR, LANDED, rest } from "../stage/desk.ts";', expect: "DIFF" },
];
const proof = join(import.meta.dirname, "814-e2e-a-proof.ts");
let bad = 0;
for (const row of ROWS) {
  const path = join(head, row.file);
  const before = readFileSync(path, "utf8");
  const hits = before.split(row.find).length - 1;
  if (hits !== 1) {
    console.log(`${row.id}: the text to mutate occurs ${hits} times in ${row.file}`);
    bad++;
    continue;
  }
  writeFileSync(path, before.replace(row.find, row.replace));
  const r = spawnSync(process.execPath, [proof, repo, base], { env: { ...process.env, HEAD_ROOT: head }, encoding: "utf8" });
  writeFileSync(path, before);
  if (readFileSync(path, "utf8") !== before) throw new Error(`${row.file} was not restored`);
  const verdicts = r.stdout.split("\n").filter((l) => /^(same|DIFF) {2}/.test(l));
  const own = verdicts.find((l) => l.split(/\s+/)[1] === `${row.family}:`);
  const others = verdicts.filter((l) => l !== own && l.startsWith("DIFF"));
  const got = own?.startsWith("DIFF") ? "DIFF" : own?.startsWith("same") ? "same" : "missing";
  const ok = got === row.expect && others.length === 0;
  if (!ok) bad++;
  const first = r.stdout.split("\n").find((l) => l.startsWith("      ")) ?? "";
  console.log(`${row.id} ${ok ? "as expected" : "UNEXPECTED"}: ${row.family} ${got} (expected ${row.expect})${others.length ? `; also ${others.join(", ")}` : ""}${got === "DIFF" ? `; first line: ${first.trim().slice(0, 140)}` : ""}`);
}
process.exit(bad === 0 ? 0 : 1);
```

### `814-e2e-b-typeprobe.ts` (sha256 be5468afbd1bfcc446263ec6075501c75da8711c8354da70603a50bd9d30abe1)

Row S1's type check.

```ts
// usage: node 814-e2e-b-typeprobe.ts <head root>
// Issue #814 pull request 4: retypes the moved Fit's `clientW` field in e2e/suites/runninghead/gallery.ts, runs the project's first type check, prints its first error lines and exit, and restores the file byte for byte.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const head = process.argv[2];
if (head === undefined) {
  console.error("usage: node 814-e2e-b-typeprobe.ts <head root>");
  process.exit(2);
}
const path = join(head, "e2e/suites/runninghead/gallery.ts");
const before = readFileSync(path, "utf8");
const after = before.replace("type Fit = { scrollW: number; clientW: number;", "type Fit = { scrollW: number; clientW: string;");
if (after === before) throw new Error("Fit's clientW field is not where the probe expects it");
writeFileSync(path, after);
const r = spawnSync(join(head, "node_modules/.bin/tsc"), ["--noEmit"], { cwd: head, encoding: "utf8" });
writeFileSync(path, before);
if (readFileSync(path, "utf8") !== before) throw new Error("not restored");
console.log(`tsc exit ${r.status}`);
console.log(r.stdout.split("\n").slice(0, 3).join("\n"));
```

### `814-e2e-b-cuts.ts` (sha256 064d9b3e6e2dd871d9fa4011478aca7a384775cfdb937485cd6f7181bacf9d0b)

Planning only: the ranks behind call 2 and the Per family table's runners-up. The build does not run it.

```ts
// usage: node 814-e2e-b-cuts.ts <repo> <file>:<function> ...
// Issue #814 pull request 4, planning only: for each named function, every contiguous run of whole statements in one of its blocks that a helper could take whole, with the names it would need (the function's parameters and locals it reads; a local is starred), the names it would hand back (its own declarations read after it), what it would write that it does not own, and the predicted sizes in lines of code (tokens' lines, comment-only and blank lines skipped, a signature or call over 120 characters counted as Prettier breaks it, roughly). Runs at the function's top level are listed when any fits, those inside a block only when none does, then pairs of top-level runs when no single run fits; each list is ranked fewest names, most headroom, nothing handed back, the later run. Which run is one check, one gesture or one fixture read is the reader's call, not the tool's; the dry run's lint count is the measure, not these predictions.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const [repo, ...targets] = process.argv.slice(2);
if (repo === undefined || targets.length === 0) {
  console.error("usage: node 814-e2e-b-cuts.ts <repo> <file>:<function> ...");
  process.exit(2);
}
const ts = createRequire(join(repo, "package.json"))("typescript") as typeof import("typescript");
type Node = import("typescript").Node;
type Block = import("typescript").Block;
type Statement = import("typescript").Statement;

const BOUND = 48;
const MUTATORS = new Set(["push", "set", "add", "splice", "delete", "unshift", "clear", "pop", "shift", "sort", "reverse"]);

const flagged = new WeakMap<object, boolean[]>();
function codeLines(sf: import("typescript").SourceFile, from: number, to: number): Set<number> {
  let flags = flagged.get(sf);
  if (!flags) {
    const f: boolean[] = [];
    const lineOf = (p: number): number => sf.getLineAndCharacterOfPosition(p).line;
    const visit = (n: Node): void => {
      if (n.getChildCount(sf) === 0) {
        const s = n.getStart(sf);
        if (n.end > s) for (let l = lineOf(s); l <= lineOf(n.end - 1); l++) f[l] = true;
        return;
      }
      n.getChildren(sf).forEach(visit);
    };
    visit(sf);
    flags = f;
    flagged.set(sf, f);
  }
  const out = new Set<number>();
  const a = sf.getLineAndCharacterOfPosition(from).line;
  const b = sf.getLineAndCharacterOfPosition(to - 1).line;
  for (let l = a; l <= b; l++) if (flags[l]) out.add(l);
  return out;
}

function bindingNames(n: Node, out: string[]): void {
  if (ts.isIdentifier(n)) out.push(n.text);
  else if (ts.isObjectBindingPattern(n) || ts.isArrayBindingPattern(n))
    for (const el of n.elements) if (!ts.isOmittedExpression(el)) bindingNames(el.name, out);
}

function declaredBy(s: Statement): string[] {
  const out: string[] = [];
  if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) bindingNames(d.name, out);
  if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && s.name) out.push(s.name.text);
  return out;
}

const isFn = (n: Node): boolean =>
  ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

function refs(n: Node, after = -1): { read: Set<string>; declared: Set<string> } {
  const read = new Set<string>();
  const declared = new Set<string>();
  const visit = (x: Node): void => {
    if (ts.isIdentifier(x)) {
      if (x.getStart() <= after) return;
      const p = x.parent;
      if (ts.isPropertyAccessExpression(p) && p.name === x) return;
      if ((ts.isPropertyAssignment(p) || ts.isPropertySignature(p) || ts.isMethodDeclaration(p)) && p.name === x) return;
      if (ts.isBindingElement(p) && p.propertyName === x) return;
      if ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isBindingElement(p)) && p.name === x) {
        declared.add(x.text);
        return;
      }
      if ((ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p)) && p.name === x) {
        declared.add(x.text);
        return;
      }
      if (ts.isTypeReferenceNode(p) || ts.isQualifiedName(p) || ts.isTypeQueryNode(p)) return;
      read.add(x.text);
      return;
    }
    if (ts.isShorthandPropertyAssignment(x) && x.getStart() > after) read.add(x.name.text);
    ts.forEachChild(x, visit);
  };
  visit(n);
  return { read, declared };
}

function problems(run: readonly Statement[], outer: ReadonlySet<string>): string[] {
  const out: string[] = [];
  const visit = (x: Node, loopDepth: number): void => {
    if (isFn(x)) {
      ts.forEachChild(x, (k) => visitFn(k));
      return;
    }
    if (ts.isReturnStatement(x)) out.push(`returns at line ${line(x)}`);
    if ((ts.isBreakStatement(x) || ts.isContinueStatement(x)) && loopDepth === 0) out.push(`leaves the run at line ${line(x)}`);
    if (ts.isBinaryExpression(x) && x.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && x.operatorToken.kind <= ts.SyntaxKind.LastAssignment && ts.isIdentifier(x.left) && outer.has(x.left.text))
      out.push(`writes ${x.left.text} at line ${line(x)}`);
    if ((ts.isPrefixUnaryExpression(x) || ts.isPostfixUnaryExpression(x)) && ts.isIdentifier(x.operand) && outer.has(x.operand.text) && (x.operator === ts.SyntaxKind.PlusPlusToken || x.operator === ts.SyntaxKind.MinusMinusToken))
      out.push(`writes ${x.operand.text} at line ${line(x)}`);
    if (ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && ts.isIdentifier(x.expression.expression) && outer.has(x.expression.expression.text) && MUTATORS.has(x.expression.name.text))
      out.push(`fills ${x.expression.expression.text} at line ${line(x)}`);
    const loop = ts.isForStatement(x) || ts.isForOfStatement(x) || ts.isForInStatement(x) || ts.isWhileStatement(x) || ts.isDoStatement(x) || ts.isSwitchStatement(x);
    ts.forEachChild(x, (k) => visit(k, loopDepth + (loop ? 1 : 0)));
  };
  const visitFn = (x: Node): void => {
    if (ts.isBinaryExpression(x) && x.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && x.operatorToken.kind <= ts.SyntaxKind.LastAssignment && ts.isIdentifier(x.left) && outer.has(x.left.text))
      out.push(`a closure writes ${x.left.text} at line ${line(x)}`);
    if (ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && ts.isIdentifier(x.expression.expression) && outer.has(x.expression.expression.text) && MUTATORS.has(x.expression.name.text))
      out.push(`a closure fills ${x.expression.expression.text} at line ${line(x)}`);
    ts.forEachChild(x, visitFn);
  };
  const sf = run[0]!.getSourceFile();
  const line = (x: Node): number => sf.getLineAndCharacterOfPosition(x.getStart(sf)).line + 1;
  for (const s of run) visit(s, 0);
  return [...new Set(out)];
}

type Cut = { top: boolean; from: number; to: number; needs: string[]; gives: string[]; helper: number; left: number; why: string[] };

function analyse(path: string, name: string): void {
  const text = readFileSync(join(repo, path), "utf8");
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let fn: import("typescript").FunctionLikeDeclaration | undefined;
  const find = (n: Node): void => {
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) fn = n;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name && n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) fn = n.initializer;
    ts.forEachChild(n, find);
  };
  find(sf);
  if (!fn || !fn.body || !ts.isBlock(fn.body)) {
    console.log(`${path}:${name}: not found`);
    return;
  }
  const f = fn;
  const lineOf = (p: number): number => sf.getLineAndCharacterOfPosition(p).line + 1;
  const total = codeLines(sf, f.getStart(sf), f.end).size;
  const params: string[] = [];
  for (const p of f.parameters) bindingNames(p.name, params);
  const paramPlain = f.parameters.filter((p) => ts.isIdentifier(p.name)).map((p) => (p.name as import("typescript").Identifier).text);
  const first = f.parameters[0];
  const kitType = first && first.type && ts.isObjectBindingPattern(first.name) ? first.type.getText(sf) : "SuiteContext";
  const kitLocals = new Set<string>();
  for (const s of f.body.statements)
    if (ts.isVariableStatement(s))
      for (const d of s.declarationList.declarations)
        if (ts.isObjectBindingPattern(d.name) && d.initializer && ts.isIdentifier(d.initializer))
          for (const el of d.name.elements) if (ts.isIdentifier(el.name)) kitLocals.add(el.name.text);
  const blocks: { block: Block; outer: string[] }[] = [];
  const collect = (b: Block, outer: string[]): void => {
    blocks.push({ block: b, outer });
    const seen = [...outer];
    for (const s of b.statements) {
      const inner = (n: Node): void => {
        if (isFn(n)) return;
        if (ts.isBlock(n)) {
          const extra: string[] = [];
          const p = n.parent;
          if (ts.isForOfStatement(p) || ts.isForInStatement(p) || ts.isForStatement(p)) {
            const init = p.initializer;
            if (init && ts.isVariableDeclarationList(init)) for (const d of init.declarations) bindingNames(d.name, extra);
          }
          if (ts.isCatchClause(p) && p.variableDeclaration) bindingNames(p.variableDeclaration.name, extra);
          collect(n, [...seen, ...extra]);
          return;
        }
        ts.forEachChild(n, inner);
      };
      ts.forEachChild(s, inner);
      seen.push(...declaredBy(s));
    }
  };
  collect(f.body, params);
  const cuts: Cut[] = [];
  for (const { block, outer } of blocks) {
    const st = block.statements;
    for (let i = 0; i < st.length; i++)
      for (let j = i; j < st.length; j++) {
        const run = st.slice(i, j + 1);
        if (block === f.body && i === 0 && j === st.length - 1) continue;
        const before = new Set([...outer, ...st.slice(0, i).flatMap(declaredBy)]);
        const read = new Set<string>();
        const declared = new Set<string>();
        for (const s of run) {
          const r = refs(s);
          r.read.forEach((x) => read.add(x));
          r.declared.forEach((x) => declared.add(x));
        }
        const needs = [...read].filter((x) => before.has(x) && !declared.has(x)).map((x) => (params.includes(x) ? x : `${x}*`)).sort();
        const own = run.flatMap(declaredBy);
        const later = refs(f.body, run.at(-1)!.end).read;
        const gives = own.filter((x) => later.has(x)).sort();
        const why = problems(run, before);
        const runLines = codeLines(sf, run[0]!.getStart(sf), run.at(-1)!.end).size;
        const kitNames = needs.filter((x) => !x.endsWith("*") && !paramPlain.includes(x)).concat(needs.filter((x) => x.endsWith("*") && kitLocals.has(x.slice(0, -1))).map((x) => x.slice(0, -1)));
        const loose = needs.filter((x) => !kitNames.includes(x) && !kitNames.includes(x.replace("*", "")));
        const bag = kitNames.length ? `{ ${kitNames.join(", ")} }: Pick<${kitType}, ${kitNames.map((x) => `"${x}"`).join(" | ")}>` : "";
        const plist = [bag, ...loose.map((x) => `${x.replace("*", "")}: Typexxxxxx`)].filter((x) => x !== "");
        const sig = `async function helperNameXXXXXX(${plist.join(", ")}): Promise<void> {`;
        const sigLines = sig.length > 120 ? 2 + plist.length : 1;
        const call = `${" ".repeat(4)}const ${gives.length > 1 ? `{ ${gives.join(", ")} }` : gives[0] ?? "x"} = await helperNameXXXXXX(${[kitNames.length ? `{ ${kitNames.join(", ")} }` : "", ...loose.map((x) => x.replace("*", ""))].filter((x) => x !== "").join(", ")});`;
        const callLines = call.length > 120 ? 3 : 1;
        const helper = runLines + 1 + sigLines + (gives.length > 0 ? 1 : 0);
        const left = total - runLines + callLines;
        cuts.push({ top: block === f.body, from: lineOf(run[0]!.getStart(sf)), to: lineOf(run.at(-1)!.end), needs, gives, helper, left, why });
      }
  }
  const all = cuts.filter((c) => c.why.length === 0 && c.helper <= BOUND && c.left <= BOUND);
  const fits = all.some((c) => c.top) ? all.filter((c) => c.top) : all;
  const score = (c: Cut): number[] => [c.needs.length + c.gives.length, Math.max(c.helper, c.left), c.gives.length > 0 ? 1 : 0, -c.from];
  const cmp = (a: number[], b: number[]): number => a.reduce((d, x, i) => d || x - b[i]!, 0);
  fits.sort((a, b) => cmp(score(a), score(b)));
  console.log(`${path}:${name} (line ${lineOf(f.getStart(sf))}, ${total} lines of code): ${fits.length} single runs fit`);
  for (const c of fits.slice(0, 10))
    console.log(`    ${c.top ? "" : "(nested) "}${c.from}-${c.to}: names ${c.needs.length + c.gives.length} [${c.needs.join(", ")}] -> [${c.gives.join(", ")}], helper ${c.helper}, left ${c.left}`);
  if (fits.length === 0) {
    const clean = cuts.filter((c) => c.top && c.why.length === 0 && c.helper <= BOUND);
    const pairs: [Cut, Cut, number][] = [];
    for (const a of clean)
      for (const b of clean)
        if (a.to < b.from) {
          const left = total - (total - a.left + 1) - (total - b.left + 1) + 2;
          if (left <= BOUND) pairs.push([a, b, left]);
        }
    const pscore = ([a, b, left]: [Cut, Cut, number]): number[] => [a.needs.length + a.gives.length + b.needs.length + b.gives.length, Math.max(a.helper, b.helper, left), (a.gives.length > 0 ? 1 : 0) + (b.gives.length > 0 ? 1 : 0), -b.from];
    pairs.sort((x, y) => cmp(pscore(x), pscore(y)));
    console.log(`    no single run fits; ${pairs.length} pairs do`);
    for (const [a, b, left] of pairs.slice(0, 10))
      console.log(`    ${a.from}-${a.to} [${a.needs.join(", ")}] -> [${a.gives.join(", ")}] (${a.helper}) + ${b.from}-${b.to} [${b.needs.join(", ")}] -> [${b.gives.join(", ")}] (${b.helper}), left ${left}`);
  }
}

for (const t of targets) {
  const at = t.lastIndexOf(":");
  analyse(t.slice(0, at), t.slice(at + 1));
}
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

Measured on the dry run. `eslint-suppressions.json` and `test/repo/lint-config.test.ts` are commit 1's; each other file is its family commit's and does not change again.

| file | sha256 |
|---|---|
| `eslint-suppressions.json` | 1dc30f231369d6f0d51a36907d8399018ee19348d9755784b37b5786887ea1dd |
| `test/repo/lint-config.test.ts` | 39d80ef8b422c9efdca808786778ca16f6a635062567d44c24a2115575aa3405 |
| `e2e/suites/print-room/atlas.ts` | b9a88dfd3a2dc0d7ac7a6b3370de210e85d0bdd99b8492e3ebd363dcf3f91169 |
| `e2e/suites/print-room/link.ts` | 942800c5523473ec35cee338bb9ede7f9ab608c235006250dc1de23b5ddffc79 |
| `e2e/suites/print-room/plates.ts` | 6870e0bd0fb5268c7fe9817641f960a5e61ab5e5fdcd99018ac9dec7185f8b6e |
| `e2e/suites/print-room/print.ts` | eb32b125e253028ed7d5a662568030628749e67e867b1665916e66235e2012cb |
| `e2e/suites/print-room/redraw.ts` | 11a7ee46153c0bb0f288acf56274a426759bd77e01964511695f9ca5a7fac122 |
| `e2e/suites/prospect.ts` | d323e89b2d521c48942963a61fb21767ff050ccd4dbbcdb3d980f8ad7c6728ed |
| `e2e/suites/reading-room/kit.ts` | 97cc83c2169c005231d5fa6fc7a9edf955d0f923baea78d54bd3307b3fa11d28 |
| `e2e/suites/reading-room/arm.ts` | 9419a257ecd36150d200ec717ade0295cb02113fe16f81e0b3fabc37de166da1 |
| `e2e/suites/reading-room/colophon.ts` | e4e6283bd261e522c245fbe657f02b89ac3d43ff5c8a0f2d6237ac3188fd5a84 |
| `e2e/suites/render.ts` | 26398e9db3937dc639132814fc8f87629c2d38cc53a43d8a70e13084b957160e |
| `e2e/suites/ribbon.ts` | c8092511435bd9ab501e7ea825cfea8119f7726983bff61038e306db1e7fafb9 |
| `e2e/suites/room-ink.ts` | ca1d466a0c7a9b3d8e1f43202a4b867c71eb39b24393a9b64e44904ec9541795 |
| `e2e/suites/room-voyage-route.ts` | b8fd6985ed43c150762544296f0285dcdf822302f4b2a2e6faaead1f3dfc8d38 |
| `e2e/suites/room-voyage-route/full-log.ts` | 5408ac9465c0ba2d45547390edd33cab78cde66385c7a0baa11a9537fa2c6a46 |
| `e2e/suites/runninghead/gallery.ts` | a103be523647b6ea4e70fb24012b29ec017437bb03c0a2cfe7ecb56869fb4c74 |
| `e2e/suites/specimen/desktop.ts` | 8133c19f546ede93981a75d91f6288af4ce8ccdaaff11ffa8fdae62ad7f6a02e |
| `e2e/suites/stage.ts` | 1f08ee20ad18f8e6bf571fcbe1139f7e18c94552060b213ca482832a0c241acc |
| `e2e/suites/stage/stage.ts` | 552042d6ed1d2748f8ace902f7c8796f3446d7109558e4e643a4aec4eff52a6d |
| `e2e/suites/stage/desk.ts` | 4f0b32b2e5bb3f7892e9894e89e668424612a9bc4d5cca2f24e2eb228216cb9a |
| `e2e/suites/stage/short.ts` | 1f900da3853f1ea0f9e2340b73c2a347e0cc3bb5b6f0606febf1545b71a4a7bd |
| `e2e/suites/survey/beat.ts` | 2bdb2df11e61ef5e0d54d20222668747e7b546bf8e5440f8a9a0d130d0799d5b |
| `e2e/suites/survey/mount.ts` | 4637a210bf2ca6c27761890c17a52abe20d9c8b0d8c71ca7a81c0c730157e3ee |
| `e2e/suites/survey/turn.ts` | cabceddf3e3fe96ebb366ec840f97d26b2935b01640e629fa21297e6223e4db6 |
| `e2e/suites/turn.ts` | c040983179aaf620933b54f3cf95168c6314596171cabaf01860649132920655 |
| `e2e/suites/zoom/kit.ts` | 2d51ace4f224e6cfe20644c0742c741f263c3dc4ed02c35c3909e38a153c3479 |
| `e2e/suites/zoom/bands.ts` | fdf462deab14bb9ab5dc0207744e30e493f74a311c2d1bb29df9af891e91f474 |
| `e2e/suites/zoom/resets.ts` | c5a767329b4b3238d7fda9ae4ef2203f6365eeb32288a826f8eb1a6919b5a274 |
