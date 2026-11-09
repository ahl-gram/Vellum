# Issue #1273, pull request 5 of 7, revision 1: BR1c loads the Explorer it reads

**Revision 1 of `handbook/plans/1200/1273/1273-pr5-plan.md`.** What it changes against that plan:

1. Group Y's edit to `e2e/suites/broadside.ts` keeps the Explorer's load that `br1Groups` carried, now
   inside the BR1c step, so BR1c reads the page it expects in lane order as well as alone.
2. The plan's sentence under Tests ("The suites the sixteen leave ... lose a check each that read a page
   and changed nothing, so no later check there loses a state; the one wiring move is L13's landing
   witness") is withdrawn. "The sweep" below replaces it: every deletion and narrowing in the pull
   request, read for the navigation, emulation, pointer, storage and health base it set or left, against
   the later checks of its own suite and the next suite in its lane and in canonical order. BR1c is the
   one reader that needs a fix.
3. Evidence 3's solo suite runs become lane-order chains, since a solo run starts every suite on the
   Explorer and is how this defect got past the plan.
4. Stop conditions S3 and S6 are rewritten, and S16 and S17 added.
5. Calls made gains 22 and 23.

Everything else that plan built stands unchanged: its commits C1 to C13 (`6c19e0a4` to `ed93de99` on the
branch), its Files, its Tests and their readings, its Coverage we lose, its Calls made 1 to 21 and its
Rulings.

**Planned at**: `origin/main` 5f75fa5c644935ebb2df1fae842f09c67bc14bf1, re-fetched for this revision and
unchanged since the plan before it; the pull request's branch `chore/1273-chrome-cuts` at
ed93de99d73edc6031ba0e0994e89ab647c819de (`git ls-remote origin refs/heads/chore/1273-chrome-cuts`), PR
#1280 open at that head with no comments. Issue #1273 comments read: 30 (the plan before counted 26; since
then the dispatcher's three `Plan archive, not a ruling: 1273-pr5-plan.md` copies at 09:39:59, 09:40:28
and 09:40:34, and the implementer's step 12 calls comment at 10:27:32, all 2026-11-09).

**Rulings**: none new. The hand-back is a plan defect and this revision opens no decision (the
dispatcher's brief). The rulings the plan before folded stand
(https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6731645726 and
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6736606647, with the earlier ones its
Rulings line names).

**Open decisions**: none.

**The revision's number** is 1 by workflow step 8's count: the branch carries
`handbook/plans/1200/1273/1273-pr5-plan.md` and no revision of it
(`git ls-tree -r --name-only origin/chore/1273-chrome-cuts -- handbook/plans/1200/1273/`), main carries no
pull request 5 plan (`git ls-tree -r --name-only origin/main -- handbook/plans/1200/1273/`), and the
issue's plan archive comments name `1273-pr5-plan.md` alone.

## Why it came back

Stop S3, a check the plan did not change reds. Reproduced in this planner's tree, detached at ed93de99,
built there (`npm run build`, log `out/1273-dry-run/1273-pr5r1-build.log`):
`VELLUM_E2E_SUITES=ribbon,broadside npm run test:e2e`, log
`out/1273-dry-run/1273-pr5r1-ribbon-broadside-unstaged.log`, printed
`BR1c never reached its assertion: TypeError: Cannot read properties of null (reading 'l')` and
`SOME FAILED, and 2 checks skipped on purpose (RB21, RB22, Issue #1269)  (45/46)`. The implementer's
own `VELLUM_E2E_SUITES=broadside` run passed 25 of 25.

The cause: on main, `br1Groups` opened with the suite's one load before BR1c,
`await goto(EXP + "#seed=42&style=antique", "broadside-base");` (`e2e/suites/broadside.ts` line 92 at
5f75fa5c), and Group Y deleted it with BR1's read. The runner starts each lane on `/explorer/` (`PAGE`
in `e2e/support/runner.ts`) and does nothing between suites but rescue one that stopped early
(`runSelected` in `e2e/support/suites.ts`), so alone BR1c read an Explorer the harness happened to
leave, and behind `ribbon` it read the Ribbon, which carries no `#broadside`, so `legendClear`'s
`m.sl!.l` read null. `handbook/specs/settle-doctrine.md` clause 14 names the shape ("a suite that reads
the page it expects without navigating of its own goes red in lane order and green alone"), and item
11's precondition is the step the plan skipped: before a check goes, every state its body sets that a
later check reads is set by that later check itself.

## Specs

Beyond the plan's Specs line, read before building C14: `handbook/specs/settle-doctrine.md` clause 9
(a same-URL navigate returns on the stale document), clause 14 in full (lane order, and attributing a
lane-order red by bisecting the order), item 11's precondition; `vellum-footguns` Gate 2.

## The fix

**Files: `e2e/suites/broadside.ts` alone**, line 68 at ed93de99. Old, exactly once in the file:

```ts
  await step("BR1c", () => br1cLegendClears(k));
```

New:

```ts
  await step("BR1c", async () => {
    await k.goto(k.EXP + "#seed=42&style=antique", "broadside-base");
    await br1cLegendClears(k);
  });
```

`k.goto` is `toExplorer` (`broadsideKit` in `e2e/suites/broadside/kit.ts`): `bounce` through
`about:blank`, `explorerUp`, then `waitSettled`, so it loads a fresh Explorer from any page, the label
and the address being the ones `br1Groups` used. Nothing else in the file changes: line 1's comment,
`br1cLegendClears` and its exports stay, the load stays after `errBase` and `httpBase` are taken (so
BR8's gate counts its requests, as on main), and the comment in `br8Clean` ("This suite chains
Page.navigate hops from its first goto") is true again. The step holds what main's step "BR1 to BR1c"
held less BR1's one read. This is the implementer's proposed fix, verified below rather than taken.

**Alternatives rejected:**

- **The load inside `br1cLegendClears`**: `test/e2e/broadside-waits.test.ts` ("BR1c reads each size only
  once the room has laid out there ...") drives `br1cLegendClears` on a recording context and deep-equals
  the CDP methods it sends, the first `Emulation.setDeviceMetricsOverride`; a `Page.navigate` inside the
  function reds that test, which no group of the plan names.
- **The load before the step, outside it**: a load that fails there takes the suite down and every
  check after it, which `vellum/e2e-throw-inside-step` (`scripts/lint/e2e-steps.ts`) exists to refuse;
  main's step held it inside.
- **A set-up step of its own**: it would print no check, and the house puts a check's set-up inside that
  check's step, as call 19 put L13's landing witness inside L18.

## The sweep: each deletion against what a later check reads

Read on main (5f75fa5c) and on the branch (ed93de99) for every suite the pull request touches. "Lane" is
the next suite in `E2E_LANES` (`e2e/support/lanes.ts`); "canonical" the next in `E2E_SUITE_ORDER`
(`e2e/support/suites.ts`), the order a proof-runner selection and any local `VELLUM_E2E_SUITES` run
follow. Lanes B, C and D each run in canonical order, so a selection of adjacent lane members reproduces
the lane. Each reading named is under "Readings", below.

| suite | what went | what it set or left | its later reader | verdict | reading |
|---|---|---|---|---|---|
| `broadside` | BR1 (`br1Groups`, the suite's first step) | the Explorer at `#seed=42&style=antique`, loaded fresh | BR1c reads `LEGEND_ROOM` without navigating | **fix: the load moves into BR1c's step** | R0 reds, R1 passes |
| `broadside` | BR11 (`br11Allowlist`) | nothing: one `evaluate` | BR2 | none | R1 |
| `broadside` | BR9 (`br9Authored`) | a scripts-off Explorer, then `leaveBlank` | BR15, whose `goto` bounces to its own address | none | R1 |
| `reading-room` | RR38 (`rr38Authored`, the suite's first step) | a scripts-off `/reading-room/`, then `leaveBlank`, before the suite's raw `Page.navigate` to `/reading-room/#seed=42&style=antique&legend=1` | RR0's `boot` polls `__vellumReadingRoomUsesWorker`, which only the Reading Room defines (`makeRoom` in `e2e/support/room.ts`); `rrErrBase` is taken after the navigate | none: the navigate now leaves the Explorer page broadside leaves (lane B and canonical) or the lane's `/explorer/`, a cross-path load either way | R1: all 47 reading-room checks behind broadside, RR12 and RR13, its console and 4xx gates over that base, among them |
| `prospect` | PB12 (`pb12Markup`) | an `opened` wait and `parkMouse` | PB14, which waits `opened` and parks the pointer itself (`pb14Glass`) | none | R1, R5 |
| `prospect` | PB16 (`pb16ScriptsOff`) | a scripts-off `/prospect/` load | PB17, whose `goto` hops through `/faq/` (`prospectKit`) | none | R1, R5 |
| `ribbon` | RB11 (`rb11Markup`) | an `opened` wait and reads | RB12, which waits `opened` and moves the pointer to (1, 1) itself (`rb12Dress`) | none | R0, R1 |
| `render` | R16 (`r16HostContract`) | nothing: one `evaluate` | R19, and the suites that settle on render's page (`INHERITS_HARNESS_PAGE`) | none | the implementer's `render,fallback,hunt` run at ed93de99, 49 of 49 |
| `hunt` | HG6 (`hg6Skeleton`, inside `huntRoom`, mid-suite) | nothing: one `evaluate` | HG7; hunt's later steps and its end, which print-room's `NEEDS_PREDECESSOR` leans on, are unchanged | none | R5 |
| `print-room` | PR36 (`pr36Authored`, the suite's last step) | a scripts-off `/print-room/` | lane A: nothing follows; canonical: prospect's `pb1WayIn`, a raw navigate to `/explorer/#seed=42&style=antique&legend=1` polling `__vellumUsesWorker`, `#map svg` and `#status` | none: print-room now ends on PR40's last room, `/writing-room/` (`ROOMS` in `e2e/suites/slide-away/kit.ts`), a cross-path load to the Explorer | R5 |
| `chart-drawer` | CD55 (`cd55WhereAuthored`) | a scripts-off Portfolio, then `leaveBlank` | CD56's `forget()` before its `bounce` now runs on CD21's Portfolio, so it does remove the device's table key, where on `about:blank`, which "has no storage of its own" (the comment opening `run` in `e2e/suites/chart-drawer.ts`), it removed nothing | none: CD56's address names its folio (`table=${ONE}`), so the device's pile is not what it reads, and every later arrival is bare by the suite's own design (that comment) | the implementer's `room-address,chart-drawer` run at ed93de99, 43 of 43 |
| `landfall` | L13 to L17 | L13's landing witness; L15's payload scrolled each shelf plate into view, decoded it and scrolled back to (0, 0) | L18 to L30 | none beyond the plan's move of the witness to L18; `l18Corner` scrolls to the top itself, and the shelf plates carry their size attributes, so a late decode moves no layout | the implementer's `landfall` run at ed93de99, 39 of 39 (landfall heads lane D, so its solo run is its lane order) |
| `document-rooms` | IX restore (the suite's last step), the `setTouch(false)` before NA3, IX2, IX4, NA3, IX6, IX9 to IX14 | main ended on a settled Explorer at 1280x800 with touch off; the branch ends on the Q & A at 1280x800 | lane D: slide-away, whose SW1 opens the Prospect through `openRoom` (its own size, then `open`'s bounce and rest in `e2e/suites/stage/stage.ts`); canonical: specimen, which sets 1280x800 and loads its own page; touch is already off, since chart-drawer turns it off after CD48 (`kd.setTouch(false)` in `cd9Surfaces`) and nothing after that turns it on | none | R2; the implementer's `runninghead,cluster,document-rooms,specimen` run (document-rooms then specimen) |
| `runninghead` | all but the sweep, RH32, RH31 and RH8 | the same last page as main (`rh8Clean`'s navigate to `/explorer/` and `waitReady`); the pointer now at (1, 700) from RH31's `finally`, where main's last pointer move was RH23's (`liftedPlate` and `wheeled` in `e2e/suites/runninghead/gallery.ts`) | lane B: stage; canonical: cluster | none | R3; the implementer's `runninghead,cluster,...` run |
| `cluster` | CL1 (the suite's first step), CL2, CL4, the desk notice's other arms, DR11 to DR16, AT1 to AT8 | CL1's `settleHome` and `landed`, which the plan moved into CL5; `CL restore` stays last | CL5, DN5; specimen next in lane C | none beyond the plan's move | R4 |
| `corners` | CO3, CO5 to CO7, FL1, FL3, FL4, FL6, and CO1's other pages | CO1's first load now the Print Room's, through `load`, which turns touch off, sets its window and bounces; FL8 and the `finally` still end the suite | in-suite; canonical: stage | none | R4 |
| `slide-away` | SW4, SW1's and SW2's other rooms, SW7's Explorer arm, FS2's 1280 arm | each arm left opens its room through `openRoom` or `openAt` | in-suite; last in lane D and in canonical order | none | R2 |
| `home` | H1, H2, H12a to H12c, H14d, H15c, H15d, H16, H18, H19b, H20's arms | the suite's own first navigate and its last step (H21) unchanged | in-suite (the plan before staged it); survey next in lane C | none | the implementer's `home` run at 1f307465, 31 of 31 (home heads lane C; C12 and C13 change no home file) |

## Tests

No unit test is added or changed, and no guard is new or strengthened: BR1c's assertion and its read
are main's, so the prover owes no row for this revision and the plan's rows stand. Two readings,
taken in this planner's tree at ed93de99, built there (`out/1273-dry-run/1273-pr5r1-build.log`):

- **The branch as built (the load missing)**: R0, BR1c never reaches its assertion behind ribbon
  (above).
- **The fix staged**: R1, BR1c passes behind prospect and ribbon. Its nearest instance to failing is the
  1280 read's sheet edge, `sh.r` 729.2 against the Glass's left less 8, 735.0: 5.8 px clear (the 1680
  read's and the return's `sh.b` stand 6 px clear).

## Readings

Each in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a1a429d82f965a5be/out/1273-dry-run/`
(the dispatcher copies the folder to the main checkout's `out/1273-dry-run/`), each run alone after `ps`
showed no other suite or build running, on the site `npm run build` made in this tree at ed93de99. The
staged fix is a copy, never source: `node out/1273-dry-run/1273-pr5r1-stage.ts` writes
`out/1273-dry-run/pr5r1/broadside.ts` from `e2e/suites/broadside.ts` with its imports mapped and the
one edit above, and `out/1273-dry-run/1273-pr5r1-run.ts` is `e2e/run.ts` with that copy in the suite map
in place of `broadside`. Every log's `fingerprint:` line reads `darwin 25.6.0 arm64; Node v26.13.0; Brave
Browser Chrome/157.0.8103.39`.

- **R0**, `VELLUM_E2E_SUITES=ribbon,broadside npm run test:e2e`, `1273-pr5r1-ribbon-broadside-unstaged.log`:
  45 of 46, BR1c never reached its assertion (above).
- **R1**, `VELLUM_E2E_SUITES=prospect,ribbon,broadside,reading-room node out/1273-dry-run/1273-pr5r1-run.ts`
  (fix staged), `1273-pr5r1-lane-b-head.log`: `ALL PASS, but 2 checks skipped on purpose (RB21, RB22, Issue
  #1269), so this run proves less than a pass  (121/121)`, 25 broadside checks (BR8, the suite's console
  and 4xx gate, over the load the step now makes) and 47 reading-room checks; reading-room 22.9 s,
  broadside 19.5 s.
- **R2**, `VELLUM_E2E_SUITES=document-rooms,slide-away npm run test:e2e`, `1273-pr5r1-lane-d-tail.log`:
  `ALL PASS  (12/12)`.
- **R3**, `VELLUM_E2E_SUITES=runninghead,stage npm run test:e2e`, `1273-pr5r1-lane-b-tail.log`:
  `ALL PASS, but 2 checks skipped on purpose (EA7, Issue #897; EA8, Issue #897), so this run proves less
  than a pass  (24/24)`.
- **R4**, `VELLUM_E2E_SUITES=room-instrument,cluster,specimen,writing-room,corners npm run test:e2e`,
  `1273-pr5r1-lane-c-tail.log`: `ALL PASS  (74/74)`.
- **R5**, `VELLUM_E2E_SUITES=hunt,print-room,prospect npm run test:e2e`, `1273-pr5r1-print-room-prospect.log`:
  `ALL PASS  (121/121)`.

**The implementer's runs the sweep and Evidence 3 cite**, each in the shared scratchpad
`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/6ab4caa8-0847-44f2-8513-1e90a67513b2/scratchpad/`,
each placed at its commit by the log's time against the branch's commit times (C11 `1f307465` at 05:18:04,
C13 `ed93de99` at 05:32:30, 2026-11-09, local): `1273-e2e-cd.log` (`room-address,chart-drawer`, 43 of
43, CD25 skipped on purpose, Issue #716; ended 05:36:01, so at ed93de99), `1273-e2e-landfall.log`
(`landfall`, 39 of 39; 05:35:01, ed93de99), `1273-e2e-hunt.log` (`render,fallback,hunt`, 49 of 49; 05:36:16,
ed93de99), `1273-e2e-home.log` (`home`, 31 of 31; 05:19:25, 1f307465) and `1273-e2e-rcds.log`
(`runninghead,cluster,document-rooms,specimen`, 38 of 38; 05:19:57, 1f307465). No file of those suites
changed between 1f307465 and ed93de99 but `e2e/suites/hunt/room.ts`, whose run is the ed93de99 one.

## Steps this plan makes longer

BR1c's step, against main: main's step "BR1 to BR1c" held the load, BR1's read and BR1c; this one holds
the load and BR1c, so it is not longer than what ships, and "Who finds a slow step"
(`handbook/specs/settle-doctrine.md`) owes it no reading. The audit's CI medians
(`out/e2e-audit/checks.tsv` in the main checkout) put BR1 at 2.2 s, carrying the load as the suite's
first check, and BR1c at 1.75 s. CL5 and L18 stand as the plan before counted them.

## Order of commits

1. **C14**, the next commit on `chore/1273-chrome-cuts` after ed93de99: this revision copied unchanged
   to `handbook/plans/1200/1273/1273-pr5-r1-plan.md`, beside `1273-pr5-plan.md`, which stays as it is,
   and the one edit to `e2e/suites/broadside.ts`. Subject
   `#1273 BR1c loads the Explorer it reads (pull request 5, revision 1)`, with the trailer block the
   plan before gives (`Drafted-By: vellum-implementer (<your model id>)`,
   `Co-Authored-By: Claude <noreply@anthropic.com>`,
   `Claude-Session: https://claude.ai/code/session_01DktzEsgi5kpQKoCNpTbKn6`). Push.
2. Evidence 1 to 3 below, each as its own command.
3. A new dated comment on Issue #1273 (the step 12 comment is never edited): calls 22 and 23 below, one
   line each, and a pointer to this revision by its archived path.
4. The PR body edited to name this revision and what it changed (the five points at the top, one line
   each), and to name the chains of Evidence 3 as the e2e runs made, replacing the solo runs it names.
5. Then the plan before's own steps from where the build stopped: its Evidence 4 to 6, the prover and
   the cold skeptic, as it sets them.

## Evidence

Replaces the plan's Evidence 3. Its Evidence 1, 2, 4, 5 and 6 stand, with
`test/e2e/broadside-waits.test.ts` added to the list in its Evidence 2.

1. After C14: `npm run check`, `npm run lint`, `npm run format:check`: green.
2. `npm test -- test/e2e/broadside-waits.test.ts test/repo/e2e-steps.test.ts`: green.
3. `npm run build`, then one at a time, each only after `ps` shows no other suite running, never the
   full local lanes:
   - `VELLUM_E2E_SUITES=prospect,ribbon,broadside,reading-room npm run test:e2e`: ALL PASS, 121 of 121,
     RB21 and RB22 skipped on purpose (Issue #1269);
   - `VELLUM_E2E_SUITES=runninghead,stage npm run test:e2e`: ALL PASS, 24 of 24, EA7 and EA8 skipped on
     purpose (Issue #897);
   - `VELLUM_E2E_SUITES=room-instrument,cluster,specimen,writing-room,corners npm run test:e2e`: ALL PASS,
     74 of 74, no check skipped in `corners`;
   - `VELLUM_E2E_SUITES=document-rooms,slide-away npm run test:e2e`: ALL PASS, 12 of 12;
   - `VELLUM_E2E_SUITES=hunt,print-room,prospect npm run test:e2e`: ALL PASS, 121 of 121.

   These runs the implementer made at ed93de99 stand, since C14 changes none of their suites and each
   already runs in lane order: `room-address,chart-drawer` (43 of 43, CD25 skipped on purpose, Issue
   #716), `landfall` (39 of 39, lane D's head) and `render,fallback,hunt` (49 of 49); and `home` at
   1f307465 (31 of 31, lane C's head; C12 to C14 change no home file). Each solo run the plan before
   named for the other touched suites is replaced by the chain above that holds it.

`vellum-plate-reader`: not owed. `vellum-pr-skeptic`: owed, cold, once, as the plan before says.

## Calls made

Adds to the plan's 1 to 21, which stand.

22. **BR1c's step carries the Explorer's load that `br1Groups` carried, inside the step.** Rule:
    `handbook/specs/settle-doctrine.md` item 11's precondition applied to a deletion, as call 19 applied
    it to L18; inside the step because `test/e2e/broadside-waits.test.ts` pins the methods
    `br1cLegendClears` sends and a load outside every step takes the suite down when it fails.
23. **Every other changed boundary in the sweep takes no edit.** Rule: item 11's precondition is met where
    the later reader navigates, waits or parks the pointer for itself, each named in the table, and each
    lane-order chain passed at ed93de99 (R1 to R5).

## Stop conditions

The plan's S1, S2, S4, S5, S7 to S12 and S15 stand. Replaced and added:

- **S3** (replaces the plan's). A chain in Evidence 3 reds on any check, or prints a total other than
  the one it names.
- **S6** (replaces the plan's). A comment on Issue #1273 newer than the thirty counted here, other than a
  dispatcher's `Plan archive, not a ruling:` copy and the implementer's own comment of the Order's step
  3.
- **S16.** Before C14, `git ls-remote origin refs/heads/chore/1273-chrome-cuts` prints a head other than
  ed93de99d73edc6031ba0e0994e89ab647c819de, or the Old line under The fix is not in
  `e2e/suites/broadside.ts` exactly once.
- **S17.** After C14, `npm run lint` names a line of `e2e/suites/broadside.ts`, or
  `test/e2e/broadside-waits.test.ts` reds.

Open decisions: none.
