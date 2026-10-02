# Issue #673 PR 4 of 7: cards, reading-room and print-room

Base: main `09cd6fd` (2026-09-27, after PR #700). Branch `chore/673-pr4-cards-rooms`. The issue's plan is `plans/673-plan.md` (frozen); PR 2's and PR 3's slice plans are `plans/673-pr2-plan.md` and `plans/673-pr3-plan.md`, whose construction rules this slice carries unchanged except where section 2 says. This is PR 4's slice, per Alex's ruling of 2026-09-26 on Issue #693, written by the third lane on this issue.

Status: after a cold `vellum-plan-skeptic` read, its four findings folded in (section 8).

Carried corrections to the frozen plan: its 6.4 (the proof's design) is superseded by calls 19, 22, 25 to 27, 39, 47 and 49; its 3.2's "longest statement 39 lines" was wrong (PR 2); its 3.2's "a group function that returns an `evaluate` or `settle` read declares its return type" is not followed where the caller can take the type from the group (calls 35 and 46); its 3.1's "a one-off joins the unstepped group beside it" is replaced by Alex's ruling on call 31 (2026-09-27, A as built): a setup line several checks share stays in `run`'s list on its own line, one that belongs to a single check moves into it.

## 1. Scope

The three suites section 4 of the issue's plan gives PR 4. Seven size markers go: `max-lines` at the head of each suite file, `max-lines-per-function` on each `run`, and the one on cards' `P20 to P27` step callback. E2e size markers 26 to 19. All three take folders (`scripts/e2e/<name>/`, the frozen plan's 3.3, Alex's ruling 2): cards is 412 lines before any split, reading-room 596, print-room 668. No runner, lane, roster, budget, step name or guard changes. Cards has five steps (`P setup`, `P19, P19b`, `P20 to P27`, `P24`, `P restore`), unchanged in `STEPPED_GROUPS`; reading-room and print-room have none.

## 2. Construction rules

PR 2's rules 1 to 11 and 6a stand, with rule 4 as Alex ruled it, and PR 3's rules 1 to 8 stand (calls 40 to 50). The frozen plan's 3.1 governs helpers: one that closes over the context goes in the suite's one kit; call 45 moves one that closes over a value `run` computed, and only one group uses, into that group. What this slice adds or meets for the first time:

1. **Kits.** Each suite has one, holding its context helpers as they are declared today: cards' `cardsKit({ ...ctx, settle })` holds `sweepAt` and carries `run`'s `settle` in its bag (specimen's form); reading-room's `readingRoomKit(ctx)` holds `boot`, `settled`, `plateShown` and `plateStaysHidden`; print-room's `printRoomKit(ctx)` holds `orderPng` (still a function declaration) and `atlasFitAt`. Under call 45, `verdict` (over `narrowCount`) moves into the P19 group and `readP15` (over `pm`) into the P15 group.
2. **A step whose body passes 50 lines calls its functions in order on its one line** (call 29), and here they hand a value between them as a `const` inside the step callback: `await step("P20 to P27", async () => { const open = await p20PinnedTakesPointer(k); await p26TailScrolls(ctx, open); await p23CapHolds(k, open); });`. Call 32 does not govern `open`: it never leaves the step, so a throw after its write ends the step exactly as the base's would. None of the three parts holds a top-level `return`.
3. **Where a switch sits follows how the checks group**, under ruling 31 and call 40. A media or metrics switch that brackets checks forming ONE group moves into it with its restore: print-room's bound print (PR21, PR35, PR22: 35 lines once `ATLAS_FIT` and `atlasFitAt` leave it), its unbound print (PR21b, PR21d, PR21c: 31 lines), its phone (PR32, PR33c: 32 lines), and reading-room's phone fixture (RR34b, RR38, RR11, RR34: 47 lines, one 49-line group with the comment at 506 inside, under Issue #648's inclusive 50; `ctx.clearMobile()` stays between its reads and its checks, where the base has it). One several groups share stays in `run` with its restore: reading-room's 1440x900 stretch (RR31, RR35, RR37, RR36: 70 lines). No instrument sees where a line sits between `run` and a group (section 5, item 6), so this rule, the one the slice leans on hardest, is read by a reviewer and by nothing else.
4. **A one-line fixture read two groups share stays in `run`** (call 40): reading-room's `deskRest` (RR31, RR35) and `room` (RR31, RR36). Where a signature must name such a read's shape and no function makes it, the type is written by hand in `reads.ts` (reading-room's `Room`, as runninghead's `Heads` in PR 3, call 46's correction); `run`'s line keeps its inline type. A check's own measurement a later group compares against is handed back (call 40): reading-room's `deskSurvey` (RR35 to RR37), print-room's `orderHref` (PRL to the navigate in `run`), cards' `pm` (the manifest read, a fixture longer than a line, handed to seventeen of the nineteen unstepped groups).
5. **A value `run` hands to a stepped group stays outside the step when the base reads it outside**: cards' `narrowCount` is an unstepped read before the P19 step, so it stays a line in `run` and is handed to the P19 group, whose step it would otherwise move into.
6. **Payload constants and types**: a module-level type goes to `reads.ts`, and so does a payload or constant that a kit helper or several groups use (reading-room's `agesRead`, `stageRead`, `stripRead` and `GOVERNING_BUDGET`; cards' `NARROW_SEED`, `OVER_BOX_TOLERANCE` and `SWEEP` with its two types; print-room's `ATLAS_FIT`, which the kit's `atlasFitAt` reads). `WIDE_WORST`, which RR37 alone reads, goes with `GOVERNING_BUDGET` because one comment (134) gives both their measurements (call 50). A payload declared inside `run` that one group uses stays with that group (call 45's `FIT_READ`): print-room's `MATTER_STATE` and `warnRead`. `SOURCE_RATIO` (`1158 / 1500`) is not a primitive, so it stays in sequence in the RR36 group; `PHONE_STRIP_MAX` stays beside RR34 under the comment (544) that leads both.
7. **Health and fallback groups** go in the folder like every group (call 42): reading-room's and print-room's `fallback.ts` import `dropExpectedCancellations` as `../console-support.ts`, the first real part file to call the drop, which PR 1's widened sweep reads (its fixtures proved the depth arm; section 5 proves it on the tree). `consoleErrors` and `serverState` are destructured in the body (the frozen plan's 3.1). A group with no `await` is not `async` and is called bare (`rr12Clean(ctx, rrErrBase, rrHttpBase);`, `pr6Clean(ctx, prErrBase, prHttpBase);`, `rr36ChartFills(ctx, room);`).
8. **Who is handed what**: a group that uses a kit helper or `settle` takes `k`; one that uses only context members takes `ctx` (runninghead's form); one that writes a literal `ctx.` call takes `ctx` by that name, beside `k` where it needs a kit helper too (reading-room's phone group takes `(k, ctx)`, call 33).
9. **A comment whose subject is a call's place in `run`'s order stays in `run` above that call**: print-room's "PR6/PR7 must stay ahead of the inline-fallback block below" and "PRW/PRW2 (#137) run LAST: they navigate away from the page every check above shares", whose "below" and "above" are true only of `run`'s list. Every other comment travels with the code it explains (PR 2's rule 11).
10. **Comments whose subject spans groups**, each left at its first instance, named so a reviewer need not find them: print-room's "Every poll below swallows and retries" (37, with PR0's first poll; every later group polls the same way) and "about:blank first, here and at every re-entry below" (101, with PRB's navigate); reading-room's seed 42 beats (103, with RR26; RR29 in the same file shows the Play it names, and RR27 and RR32 in `addresses.ts` read the beats) cards' "P2 is idle-only ... this P2b/P2c pair" (43, with P2b and P2c; P2 is the group above it in the same file); print-room's "orderPng below" (196, with PR29; `orderPng` is now in the kit and runs in the PR17 group that follows).
11. **A navigate or a redraw that is a check's own gesture moves with that check, even when later groups inherit the page it leaves; a closing dismissal that several groups' cards need stays in `run`.** Ruling 31 keeps a setup line several checks share in `run` and moves one that belongs to a single check into it; a gesture whose result the next check's own poll measures belongs to that check, and what it leaves behind is not what the later checks test. The instances, named so a cold reviewer meets one call rather than six apparent slips: print-room's PRB navigate (102-103, the bare visit PRB measures; PR10 onward inherit the page), PR10's redraw (119, whose plates PR10 polls for; PR12 to PR19 inherit the proof), PR20a's redraw (242, whose Bind PR20a polls for; PR20 to PR25 inherit it); reading-room's RR9 navigate (263-264, the bare visit RR9 measures, bracketed by the two date samples the comment at 261 explains; RR16 to RR22 inherit the page) and RR24's navigate (419-420, the boot whose pre-arm window RR24 polls; RR25 inherits the page). Cards' closing Escape (220), which dismisses whichever card P16, P18, P18b or P17 left shown, stays in `run` as its own line. The `P20 to P27` step's closing Escape and camera reset (372-373) stay in its last part, `p23CapHolds`: the three parts are one numbered group cut for size (call 29), and the reset stays inside the step as the base has it.

## 3. Per suite (base line numbers at `09cd6fd`)

### cards (412 lines; folder `scripts/e2e/cards/`)

- `run` (about 33 lines): `const { evaluate } = ctx;`, `makeStep`, `makeSettle`, `const k = cardsKit({ ...ctx, settle });`, the `P setup` step line, `const pm = await pManifest(ctx);`, nineteen unstepped group lines with the closing Escape (220) between the P17 group and the shot, the `narrowCount` read, and the `P19, P19b`, `P20 to P27`, `P24` and `P restore` step lines.
- `cards/reads.ts`: `OVER_BOX_TOLERANCE` and `NARROW_SEED` with their comments (227 to 230), `SweepRow`, `Swept` and `SWEEP` with the focus comment (232 to 251).
- `cards/kit.ts`: `sweepAt` (252 to 269).
- `cards/overlay.ts`: `pSetup` (13 to 21), `pManifest` (24 to 34, handing `pm` back) and its `Manifest` type, then one group per check: P1 (36-37), P2 and P3 (39-41), P2b and P2c (43-46), P4 to P5c (48-63; P5c reads `p4`), P6, P7, P8, P9, P10, P11, P12, P13, P14 (104-133), P15 with `readP15` (135-148). `P2c`'s guarded citations in `public/living-chart.css` and `public/motion.css` re-point here.
- `cards/glass.ts`: P16 (150-170), P18 (171-184), P18b (186-198), P17 and P17b (200-219), the place-card shot (222-225).
- `cards/cap.ts`: `p19CardsFit` (`verdict`, then 280-283), `p20PinnedTakesPointer` (288-316, P20 and P21, handing `open` back), `p26TailScrolls` (318-341, P26 and P27), `p23CapHolds` (343-373, P23, P25 and the closing Escape and camera reset), `p24NothingToScroll` (377-402), `pRestore` (406-410).

### reading-room (596 lines; folder `scripts/e2e/reading-room/`)

- `run` (about 40 lines): `readingRoomKit(ctx)`, the deep-link navigate and the two health bases (63-65), rr0Boots, rr4AtRest, rr26BareVisit, the 1440x900 switch with its comment (120-122, cited by `specs/settle-doctrine.md`), `deskRest` and `room` (123-124), rr31StripStands, `deskSurvey = rr35GoverningBudget`, rr37Envelope, rr36ChartFills, the scroll reset, metrics clear and sleep (187-189), then one line per group through rr10CrossLinks, rr34bPhone(k, ctx), rr11bScrubHandles, rr12Clean, rr14Fallback.
- `reading-room/reads.ts`: `Ages`, `AgesRead`, `Stage`, `Strip` (7-10), `agesRead`, `stageRead`, `stripRead` with their comments (35-37, 60-61), `GOVERNING_BUDGET` and `WIDE_WORST` with their comment (134-136), and `Room` written by hand.
- `reading-room/kit.ts`: `boot`, `settled`, `plateShown`, `plateStaysHidden` with their comments (16-59).
- `reading-room/arrival.ts`: RR0 to RR3 (66-78), RR4, RR4b and RR5 (79-101), RR26 and RR30 (103-118), RR29 (191-198).
- `reading-room/desk.ts`: RR31 (125-133), RR35 (137-151, handing `deskSurvey` back), RR37 (152-178), RR36 (179-186). The `errata/guards.md` row from PR #680 cites `deskSurvey.h` at `scripts/e2e/suite-reading-room.ts:176` and its note at 175: re-pointed to this file's lines, its claim unchanged (the suite still builds no step).
- `reading-room/addresses.ts`: RR6a, RR6, RR32, RR33 (200-224), RR7a to RR27b with the shot (226-259), RR9 (261-281), RR10a and RR10b (482-504).
- `reading-room/colophon.ts`: RR16 (283-288), RR17 to RR28b (290-321), the park with RR18 and RR19 (322-337), RR20 (339-358), RR21 (360-374), RR22 with the shot (375-394).
- `reading-room/arm.ts`: RR23 (396-416), RR24 (418-453), RR25 (455-480).
- `reading-room/phone.ts`: the phone fixture with its switch and clear, RR34b, RR38, RR11 and RR34 (506-552), RR11b (554-567). `RR34`'s guarded citation in `public/reading-room/index.css` re-points here.
- `reading-room/fallback.ts`: RR12 and RR13 (569-572), RR14 and RR15 (574-595).

### print-room (668 lines; folder `scripts/e2e/print-room/`)

- `run` (about 43 lines): `printRoomKit(ctx)`, `const orderHref = await prlLink(ctx);`, `hashPart`, `PR_PAGE` and their navigate (29-31), the health bases with their comment (33-35), pr0Boots, pr3World, prcCarried, prbBare, the download deny with its comment (115-117), one line per group through pr27OrderDuring, the closing shot (558) between pr32Phone and pr26Redraw, then the PR6 comment, pr6Clean, pr8Fallback, the PRW comment and prwWarp.
- `print-room/reads.ts`: `Matter`, `AtlasFit`, `Warning` (6-8), `ATLAS_FIT` (363-364).
- `print-room/kit.ts`: `orderPng` (206-216), `atlasFitAt` (365-373).
- `print-room/link.ts`: PRL (14-27, handing `orderHref` back), PRW and PRW2 (638-667).
- `print-room/proof.ts`: PR0 to PR2 (37-55), PR3, PR4, PR5 and PR30 (57-83; PR4 reads PR3's `st`), PRC (85-99), PRB (101-113).
- `print-room/plates.ts`: PR10 and PR11 (119-130), PR12 to PR15 (132-161; PR14 and PR15 read PR13's poster), PR16 (163-175), PR28 and PR29 (177-204), PR17 to PR19 (218-240).
- `print-room/atlas.ts`: PR20a, PR20 and PR20c (242-279), PR31 to PR31c (281-300), `MATTER_STATE` with PR33, its shot and PR33b (302-333), PR34 with its shot (335-351), PR23 (401-415), PR25 (476-491).
- `print-room/print.ts`: the bound print with its bracket (354-399 less 363-373), the unbound print with its bracket and `warnRead` (493-523).
- `print-room/redraw.ts`: PR24 (417-430), PR24b (432-448), PR24c (450-474), PR26 (560-579), PR27 (581-607).
- `print-room/phone.ts`: the 390 bracket with PR32 and PR33c (525-556).
- `print-room/fallback.ts`: PR6 and PR7 (610-613), PR8 and PR9 (615-635).

Each part file is under 200 lines; the three suite files are about 45, 60 and 60.

## 4. What the change drags

- The guarded CSS citations of `P2c` (`public/living-chart.css`, `public/motion.css`) and `RR34` (`public/reading-room/index.css`), which `test/repo/comment-citations.test.ts` reads; `RR34` would still resolve against the suite file's header ("RR0-RR34"), vacuously, so it is re-pointed by hand to the file that holds the check.
- `errata/guards.md`: the PR #680 row re-pointed in place (one row, no neighbour rewrapped; Issue #654's lane appends to this file). The PR #346 row names `suite-reading-room.mjs:214`, stale since the port, and the PR #645 row names suites rather than files: both left as their own records (call 48's precedent).
- `scripts/e2e/room-support.ts` line 1 says `suite-reading-room.ts` "deliberately keeps its own copies" of the room's boot and settle; the copies move to `reading-room/kit.ts`, so the name is re-pointed there, no other word changed.
- Checked unchanged: `specs/settle-doctrine.md`'s two citations of `scripts/e2e/suite-reading-room.ts` (its own 1440x900 override and the comment at it stay in `run`); `STEPPED_GROUPS` (cards' five step names, unchanged); `E2E_SUITE_ORDER`, `E2E_LANES`, `MEASURED_SECONDS`; the e2e-tiers worker and fallback assertions and the console-support sweeps, which read the family and the tree at any depth (PR #696).
- `plans/673-pr4-plan.md`, this file, archived in the first commit.

## 5. Tests and guards

No new test and no guard change is planned: the suites' own checks run in CI, and the guards PR 1 built read these shapes. The frozen plan's section 5 owes `vellum-guard-prover` on the real tree the first time real code takes a shape, and PR 4 is the first with each of these:

1. **A thrower reached through a kit helper in a folder, by a part-file group**: `await p19CardsFit(k, narrowCount);` added in cards' `run` beside its step (its throws sit in the kit's `sweepAt`); "every call of a wait that throws is INSIDE a step" reds naming it.
2. **A multi-call step line whose parts live in a part file**: `await p20PinnedTakesPointer(k);` added in `run` outside the step; the same test reds.
3. **The console-support drop called from a part file**: `reading-room/fallback.ts` importing it as `"./console-support.ts"` reds the house-import arm; `print-room/fallback.ts` reading `consoleErrors.slice(prErrBase)` without the drop reds the accumulator sweep.
4. **The worker and fallback assertions in a part file**: deleting `serverState.blockWorker = true;` from `reading-room/fallback.ts` reds "the two worker-bearing surfaces..."; turning RR1's `=== true` in `reading-room/arrival.ts` to `=== false` reds it too.
5. **A guarded citation into a folder file**: renaming `P2c` in `cards/overlay.ts` reds `test/repo/comment-citations.test.ts` for both sheets; the same for `RR34` in `reading-room/phone.ts`.
6. **The proof on the new shapes**, each `DIFF` and exit 1 against `09cd6fd`: swap the two later calls on the `P20 to P27` line; move `narrowCount` into the P19 group; swap `rr31StripStands` and `rr35GoverningBudget` in `run`; hand `p24NothingToScroll` the bare name `ctx` in place of `k`. **Expected SAME, by design, and named so the prover does not return them as holes**: moving print-room's bound-print switch out of its group into `run` (the proof compares execution order after inlining, so a statement's place between `run` and a group it runs beside is invisible to it), and handing a group any bag of spreads in place of `k` (the proof's own blind-spot comment: "a bag of spreads passes whatever it spreads"). So where a line sits (rule 3, ruling 31) has no instrument; a reviewer reads it.

## 6. Evidence

1. `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`; beside them the guard tests alone (`e2e-tiers`, `e2e-containment`, `e2e-split-proof`, `console-support`, `comment-citations`, `e2e-read-types`, `e2e-type-notes`, `sheet-height`).
2. Markers 26 to 19 by the frozen plan's grep; type notes 205 and condition markers 75 unchanged (Issue #654's greps).
3. `node scripts/e2e-split-proof.ts 09cd6fd`: 42 families, 0 differ; cards at `1 -> 6` files, reading-room at `1 -> 10`, print-room at `1 -> 11`.
4. `npm run build`, then one serial run of the three: `VELLUM_E2E_SUITES=cards,reading-room,print-room npm run test:e2e`, let run to completion (another lane shares this machine). The subset changes each suite's predecessor from CI's lanes, so a local red is first re-run on the base with the same selection before the split is suspected.
5. Both lanes' check names from this PR's CI against main's CI at `09cd6fd` (run 36299473110: lane A 309, lane B 298, identical to `23fae46`'s), detail stripped with the frozen plan's recipe, identical and counts equal.
6. The merged state before hand-off if main moves (`git merge origin/main`, never a rebase).

## 7. Calls to record on Issue #673 before the PR opens

Rules 1 to 11 above (numbered on from call 50); the folder file names; the re-pointed citations, errata row and room-support comment; the lines not moved byte for byte (the trimmed `run` destructures, the `return` lines of the four handback groups, the `export`s, the hand-written `Room`, the re-pointed comments, the removed markers, blank lines); the frozen 3.2 return-type departure carried.

## 8. The plan skeptic's findings, and what became of each

Cold `vellum-plan-skeptic` on Issue #673 and this plan, no ledger (recon did not run for this slice). One BLOCKING, two SHOULD-FIX, one NIT; all folded, none rejected.

1. BLOCKING: the draft split reading-room's phone fixture in two, its switch opening the first group and its clear closing in the second, on the premise that 47 lines could not be one group; the limit is inclusive (Issue #648) and the group measures 49 lines, so ruling 31's shape applies (a switch bracketing one group moves into it). Rule 3 now makes it one group `(k, ctx)`, and the `mobileSettled` handback and the call-50 argument are gone.
2. SHOULD-FIX: two proof mutations predicted DIFF would read SAME by the proof's design (a switch moved between `run` and its group; a bag of spreads in place of `k`): section 5 item 6 restates both as expected SAME, pins the handed-name mutation to a bare `ctx`, and says plainly that placement has no instrument.
3. SHOULD-FIX: six shared-setup lines were placed without a named principle: rule 11 now states it (a check's own navigate or redraw moves with that check; a closing dismissal several groups' cards need stays in `run`) and lists every instance; cards' closing Escape (220) moves back to `run`.
4. NIT: `WIDE_WORST` is read by RR37 alone; rule 6 now gives the reason it goes to `reads.ts` (one comment gives both budgets' measurements, call 50).

Written after the skeptic ran, so not read cold: rule 11's wording, and the one-group phone shape at 49 lines (the lint measures it).
