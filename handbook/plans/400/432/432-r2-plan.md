# Issue #432, revision r2: RB23 reads the ground only once the element that carries it has come to rest

**Planned at:** `origin/main` bbb64b5f6a0ef14e8f9e30fa7bf4a26e16dcfa5f (2026-11-03, fetched when this revision was finished; it is r1's ad2e2f59 plus one commit, `#432 RB23's two reds on CI are recorded in the flake record (#1228)`, whose only change is two rows in `.claude/skills/vellum-footguns/references/flake-record.md`, `git diff --stat ad2e2f59 bbb64b5f`), Issue #432 at 8 comments: 5533810569 (the re-baseline of 2026-09-03), 5533954847 (Alex's ruling of 2026-09-03), 6613336379 (Alex's rulings on the first plan's menu), 6613391496 and 6613392807 (the archive of `432-plan.md`), 6614303543 and 6614305148 (the archive of `432-r1-plan.md`), and 6614446779 (the implementer's calls-made comment). The four `Plan archive, not a ruling:` comments carry no ruling. Pull request #1227 is open on `feat/432-ink-in` at bad72b7663dc4d9df53b42a14a1abcde2e1b2f78 (`git ls-remote origin refs/heads/feat/432-ink-in`), six commits on ad2e2f59, with 4 comments: 6615205124 (the prover's ledger), 6615206651 (the plate reader's record), 6615840313 and 6616051584 (the red, the second correcting the first). This revision's readings ran on a build of that head (`git archive` of bad72b76 into `out/432-dry-run/branch/`, built there) and on GitHub's machines through the CI proof runner at that head, each named at its reading.

**Revises:** `432-r1-plan.md`, committed on the branch as `handbook/plans/400/432/432-r1-plan.md` (sha256 d9b57d7efe9219e9673fab11f827ba108c87c7d8239c6868ddc379bc3ffd8500, the same as its two archive comments' opening lines), archived in the main checkout as `out/plans/432-r1-plan-20261103T200940Z.md`. It is revision 2: the branch carries `432-plan.md` and `432-r1-plan.md` (`git ls-tree -r --name-only origin/feat/432-ink-in -- handbook/plans/400/432/`), main carries no plan for Issue #432 (`git ls-tree -r --name-only origin/main -- handbook/plans/400/432/` prints nothing), and the issue's four archive comments name `432-plan.md` and `432-r1-plan.md`. Both earlier plans stay frozen. Everything they planned is built at bad72b76 and stands; this revision changes only what "What this revision changes" lists, and the build it asks for is that and nothing else.

**Why:** RB23, a check this pull request adds, failed in lane B on both CI heads of the branch with one payload (run 41716916923, job 126199216116, at 034772b0; run 41719348554, job 126207684177, at bad72b76) and passed the one re-run of the second (run 41719348554 attempt 2, job 126216717201), while the Mac passes it every time. Two reds is a defect, not a flake (`vellum-footguns` Gate 2 item 10), and no entry of "Where the Mac and the CI runner disagree" in `handbook/specs/settle-doctrine.md` explained it, so it came to a fresh planner (`handbook/specs/orchestration.md`, "While lanes run"). The cause is measured below, and it is in RB23's wait, not in the code under test.

**Rulings:** Alex, 2026-09-03 (comment 5533954847), and Alex's answers to the first plan's menu, Issue #432 comment 6613336379 (https://github.com/ahl-gram/Vellum/issues/432#issuecomment-6613336379): Q1 "The whole strip (Recommended)"; Q2 "Blank paper (Recommended)"; Q3 "Sent with every scroll (Recommended)". The planner's calls 1 to 14 stand as `432-r1-plan.md` writes them (the dispatcher's brief of this revision: Alex has seen them and overruled none). Calls 15 to 19 are this revision's, for Alex to overrule. No ruling was asked for this revision: the fault is how a check waits before it reads, and nothing changes what ships, what a check claims, or a ruled statement.

**Open decisions:** none.

## What this revision changes

The difference from `432-r1-plan.md`, for the pull request body (workflow step 8). Nothing in `src/`, the sheets, `test/` or the design changes.

1. **RB23's wait after the reduced-motion switch departs only once `#map`, the element that carries the ground, lists no animation** (call 15). `INK` in `e2e/suites/ribbon/ink.ts` gains one field, `groundAnims`, the length of `#map`'s own `getAnimations()`, and `reducedSwitch` departs on `d.ends.length > endsBefore && d.groundAnims === 0`. r1's design said the wait's stillness "is what lets `#map`'s 0.01 ms transition off the ground land"; on GitHub's machines it does not (The cause, measured).
2. **RB23 runs in a step of its own** (call 16): `e2e/suites/ribbon.ts`'s step `"RB21 to RB23"` becomes `"RB21, RB22"` and `"RB23"`, RB21's duration carried between them as RB1 to RB5e's plate is carried to RB7, so a later red that pulls RB23 out of the run (`handbook/specs/settle-doctrine.md` item 11) pulls its own three claims and leaves RB21's and RB22's twelve running.
3. **RB23 carries the rewrite marker** (call 17), one line above its label, so a later red on it is read as a red on a check already rewritten once (`.claude/agents/vellum-implementer.md`, "When to hand back"; `handbook/specs/orchestration.md`, "While lanes run").
4. **The settle doctrine records the difference** (call 18): one sentence in the environment bullet on waiting for a transition, and one line in "Where the Mac and the CI runner disagree", which a difference found later joins in the change that records it.
5. **The build resumes on the branch's six commits, all frozen**: one new commit carries this plan and the two check files, and one more the doctrine (Order of commits).

## The red, re-verified

- **Both reds, one payload: CURRENT.** `gh api repos/ahl-gram/Vellum/actions/runs/41716916923/jobs` lists `126199216116 build & e2e lane B failure` at 034772b0 and every other job green; `gh api repos/ahl-gram/Vellum/actions/runs/41719348554/attempts/1/jobs` lists `126207684177 build & e2e lane B failure`, the rest green; `.../attempts/2/jobs` lists `126216717201 build & e2e lane B success`. The two failing logs (the dispatcher's `orch-1227-earlier-laneB.log` and `orch-1227-laneB.log` in the scratchpad, lines 308 and 319) carry `"faults":["and lands whole"]` and `"after":{"cls":false,"clip":"none","ground":[242,232,207,255],...,"adds":1,"removes":1,"ends":[0.00001]}`; the passing re-run's log (`432r2-laneB-attempt2.log` in the scratchpad, line 308, fetched with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/126216717201/logs`) reads `"after":{...,"ground":[0,0,0,0],...,"ends":[0.00001]}`. The fingerprint on both bad72b76 attempts reads `linux 7.0.0-1017-azure x64; Node v26.13.0; google-chrome Chrome/156.0.8078.79`.
- **The payload rules out the code.** `clear` in `src/site/ribbon/ink.ts` takes the class, the clip and the ground's inline `background-color` off in one call; `removes: 1`, `cls: false` and `clip: "none"` say it ran, so `#map`'s inline ground was gone when the wait read paper. Only an animation on `#map` can hold that colour once its declaration is gone.
- **`prospect` before `ribbon` is not the cause**: see the proof run's `ribbon`-alone entries below.

## The cause, measured

**`#map` transitions its ground under reduced motion, and the transition waits for the browser to start it.** On the branch's build (`out/432-dry-run/432-r2-probe.ts`, log `432-r2-probe.log`, part `styles`; command `node out/432-dry-run/432-r2-probe.ts out/432-dry-run/branch/dist`, run from the revising planner's tree at ad2e2f59, so the harness and the Ribbon kit are main's, which the branch does not change), `#map` computes `transition-property: all` with `transition-duration: 0s` at full motion and `1e-05s` under reduced motion, the blanket in `src/styles/shared/motion.css` (`handbook/specs/cascade-traps.md`, "Under reduced motion a change of style is a transition"); `#map`'s rect is the plate's (`[0, 878.84, 824.59, 575.66]` both). So under reduced motion the retire's removal of the ground starts a 0.01 ms `background-color` transition from paper to transparent, and nowhere else does: at full motion nothing on `#map` transitions.

**On a Mac it lands within a frame or two of the read that first sees the run's end.** The same probe traced RB23's own sequence (the witness from the new document, the first plate under reduced motion, Turn about at full motion, reduced motion switched on), logging every poll of the wait with `#map`'s animations and `document.timeline.currentTime`, and the transition events on `#map`. Fixture, as RB23's wait is built (`fixture 1`, `old`): the run's `animationend` and the class's removal at timeline 640.6 ms; `transitionrun` and `transitionstart` at 657.2; `transitionend` at 690.6. In the arm `fixture 1`, `new`, the poll that first saw the end (timeline 661.1) read the ground still `243,233,207,255` with `#map` listing `["CSSTransition","background-color","running",pending true,startTime null,currentTime 0]` after `transitionrun` and `transitionstart` had both fired, and the next poll, 50 ms on, read it transparent with nothing listed. So a poll can catch the ground at its old colour, the transition listed and still pending, and on the Mac the next poll is past it. Every arm of the wait as built passed: the three fixture arms, the frame-counted arm, and three arms with the CPU throttled 20 times (`Emulation.setCPUThrottlingRate`). The Mac does not reproduce the red, even throttled.

**On GitHub's machines the transition stays pending through two polls, and the wait as built takes them for rest.** The CI proof runner at bad72b76, run 41726439701: list `out/432-dry-run/ci/432-r2-proof.ts`, sent from the revising planner's tree with `npm run proof -- send out/432-dry-run/ci/432-r2-proof.ts --sha bad72b7663dc4d9df53b42a14a1abcde2e1b2f78 --label 432-r2-rb23` and read with `npm run proof -- read 41726439701` (ledger `out/432-dry-run/432-r2-proof-ledger.log`; each job's artifacts in `out/432-dry-run/ci/proof-41726439701/`, summarised by `node out/432-dry-run/ci/432-r2-summ.ts <that folder>` and `node out/432-dry-run/ci/432-r2-stats.ts <that folder>` into `432-r2-proof-summary.log`, `432-r2-proof-stats.log`, `432-r2-proof-traces.log` and `432-r2-proof-lift.log`). Sixteen jobs, each on its own runner: `out/432-dry-run/ci/P.diff` (RB23 as built, every poll of its wait traced, then the whole switch repeated three times with each wait) on six `prospect,ribbon` jobs and two `ribbon` jobs; `out/432-dry-run/ci/F.diff` (RB23 with the revised wait and `INK` carrying `groundAnims` in every read, the same trace and repeats) on six `prospect,ribbon` jobs; and the unpatched head twice, as the runner's own controls. Each patched job fails a deliberate `RB23P` line that carries its samples, so a row reading IMPRECISE (`RB23, RB23P`) is RB23 as built failing beside it.

- **The red reproduces, in lane order and alone.** RB23 as built failed "and lands whole" in 5 of its 8 patched runs (3 of 6 after `prospect`, 2 of 2 alone), and in 1 of the 2 unpatched controls (`control-e2e-2`, `ribbon` alone) with CI's payload exactly, `"ground":[242,232,207,255]`, `"ends":[0.00001]`. Across the repeats the wait as built accepted the paper ground in 28 of 42. So `prospect` running first is not the cause, and the dispatcher's two reds were a fair sample: the wait as built fails about two runs in three on the runner.
- **What it accepted.** In every such sample the poll that first saw the end and the poll 50 ms after it both read the ground `242,232,207,255` with `#map` listing `["CSSTransition","background-color","running",pending true,startTime null,currentTime 0]`, after `transitionrun` and `transitionstart` had both fired. Job `rb23-built-wait-lane-1`, RB23 itself: the class off at timeline 3166.8 ms, `transitionrun` at 3183.5, the wait's two equal polls at 3200.2 and 3250.2, both paper and pending, `transitionend` at 3266.8. From the class coming off to the ground's `transitionend`: 67 to 183 ms on the runner (median 117, 98 samples), against 50 ms on the Mac in all eight unthrottled arms and 50 to 117 throttled; at most one of the Mac's polls ever found the transition still listed, and up to three of the runner's.
- **The revised wait was whole in all 48 of its samples** (6 of 6 as RB23 itself, 42 of 42 repeats). Nearest its line: job `rb23-planned-wait-lane-5`'s RB23, whose two polls after the end (timeline 3100.0 and 3150.0) read paper with the transition pending, the very pair the wait as built accepts, and whose wait went on to the next poll, at 3216.6, the ground `0,0,0,0` and nothing listed. It accepted 134 to 247 ms after the class came off (median 192).
- **The premise of the revised wait held on both machines**: of the 424 polls on the runner and the 54 on the Mac taken after the end (staged arms left out), none found `#map` listing nothing while the ground was not transparent.
- **RB21 and RB22 passed in all 16 jobs**, the six that carry `groundAnims` in every `INK` read among them, and every job read `#map` at `all, 0s` at full motion and `all, 1e-05s` under reduced motion, as the Mac does.
- The jobs ran on Chrome 156.0.8078.47, 156.0.8078.79 and 155.0.8059.84, on `azure` and `aws` kernels (their `fingerprint:` lines); the wait as built failed on all three.

**Why the runner holds the start that long is UNVERIFIABLE.** The transition was listed `pending` with no `startTime` after its `transitionrun` and `transitionstart` had fired, on both machines, which is how an animation reads while it waits for the compositor to report its start; no command here shows which part of the runner's pipeline held it. The fix does not depend on why: it waits on the transition's own state.

## Where the build stands

The resuming `vellum-implementer` takes the open pull request's branch (`.claude/agents/vellum-implementer.md`, "Where you stand"): `git fetch origin feat/432-ink-in`, then `git checkout -B feat/432-ink-in origin/feat/432-ink-in`, each as its own command, and confirms `git rev-parse HEAD` prints bad72b7663dc4d9df53b42a14a1abcde2e1b2f78. The first implementer's tree, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a6cf6377e5a4dc3d9`, still held `feat/432-ink-in` (locked) in `git worktree list` when this revision was planned; the dispatcher says it is retired. It was gone from `git worktree list` when this revision was finished. Git refuses to check out a branch another worktree holds, so a checkout that says so is a hand-back, never forced. Main has moved since the branch was cut by one commit that touches only the flake record, which nothing in this revision reads or writes, so no `git merge origin/main` is owed (workflow step 10); CI's merge ref carries it.

- **Built and not touched by this revision** (f307a4b1, 74731a43, f9b3b5a8, 7b54e7c0, 034772b0, bad72b76): every file of the pull request but the two this revision edits and the one spec it edits, the archived `432-plan.md` and `432-r1-plan.md` included. No commit is amended, rebased or reverted.
- **What this revision changes in the built files:** `e2e/suites/ribbon/ink.ts` (`type Ink`, `INK`, `reducedSwitch` and one line in `rb23Reduced`) and `e2e/suites/ribbon.ts` (the step); and `handbook/specs/settle-doctrine.md` (two insertions).
- **The pull request stays open and cold-reviewed.** The cold skeptic's, the prover's and the plate reader's one round each are spent (workflow step 15), so this rewrite goes to none of them: the implementer proves it bites (Evidence), names it as proven by the implementing session only, and the dispatcher reads it before the merge (`handbook/specs/orchestration.md`, "While lanes run": a rewrite made after the cold review's one round is read only by the orchestrator).

## Specs

Read these, at these sections, on top of what `CLAUDE.md`'s spec table owes the work:

- `handbook/specs/settle-doctrine.md`: clauses 3, 5 and 6 (a wait names what shows the change; a transition leaves `getAnimations()` when it ends, so a wait on it is written on its departure; a departure read against the state the action starts from; the predicate never carries the check's claim); clause 11 (the step is the unit of the skip list; a skipped step's later readers set up their own state) and clause 15 (a red on a check already rewritten once is never re-run); "The environment", the bullet opening "A sleep past an animation's nominal duration still lands mid-animation" (near zero is not zero; the reduced-motion arm waits on a rest signal), which this revision extends; "Where the Mac and the CI runner disagree", which this revision joins; "When a check is pulled out of the run", "What a step holds" and "Who finds a slow step" (the new step is counted below).
- `handbook/specs/cascade-traps.md`: "Under reduced motion a change of style is a transition, even where no rule wrote one" (why `#map`'s ground transitions at all).
- `handbook/specs/check-placement.md`: "The browser lanes and a plate read" (RB23 reads what the page computes).
- `handbook/specs/orchestration.md`, "While lanes run" (how a second red on RB23 is handled; Stop conditions).
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" (the two doctrine insertions are imperative, cite `symbol` in `path`, carry no provenance and no bare `#N`) and the comment rule (the plan writes one comment line, the marker, in the form `.claude/agents/vellum-implementer.md` fixes).
- `handbook/specs/development-workflow.md` steps 8 (this revision archived as `handbook/plans/400/432/432-r2-plan.md` beside the two earlier plans, in the first commit the build makes), 10 and 15.
- `.claude/skills/vellum-footguns/SKILL.md` Gates 2 and 5.

## The design

**The wait's rest signal is the ground's own: the element that carries it lists no animation.** A CSS transition is listed in its element's `getAnimations()` from the style change that starts it, pending and then running, until it finishes, and then it leaves the list (clause 3), so `#map` listing nothing is the ground's transition at its end, or no transition at all. The read flushes style before it lists (`getComputedStyle` and `getAnimations()` both do), and the witness records the run's `animationend` in the same dispatch in which the plate's own listener runs `retire`, so no read can see the end recorded and the ground's transition not yet listed: every poll in every trace that saw the end either listed the transition or read the ground transparent (The cause, measured). The wait therefore departs on the run's end being recorded AND `#map` listing no animation, and asks for its usual stillness on top (two equal reads, `makeStable`'s default comparison over the whole read). It carries no part of the claim (clause 6): it reads how many animations `#map` lists, never the ground's colour, the class or the clip. A retire that leaves the ground on starts no transition, so the wait departs and the check fails on "and lands whole", which is what the staged mutation reads below; a transition that never ends times the step out by the wait's own label, which names the stuck read.

**`groundAnims` is a field of `INK`, read by every wait that reads `INK`.** At full motion `#map` transitions nothing (its duration is `0s`), so RB21's and RB22's reads gain a field that stays 0 and change nowhere; that is measured on the proof runner below (the planned arm runs RB21 and RB22 with the field). One read, written once in the module, as r1's reads are.

**RB23 stands in a step of its own.** `step` in `e2e/support/step.ts` is the unit `E2E_SKIPS` names (clause 11), so as built a red that pulls RB23 out pulls RB21 and RB22 with it. RB23 reads one thing the step before it leaves, RB21's duration (its control, "the same run's full motion inked"), carried in a `let` as `svg1` carries RB5's plate to RB7 in the same suite, and it navigates itself; nothing after it but RB9 and RB10 (console errors and 4xx deltas since the suite began) reads anything it does. Should "RB21, RB22" throw before RB21 returns, `fullMs` stays 0 and RB23 fails on its control, which is the honest reading.

**The marker** (`.claude/agents/vellum-implementer.md`, "When to hand back") sits directly above RB23's label: the rule that a check rewritten once for a red on CI is never rewritten a second time keys on it (`git grep -n -F "rewritten for a red on CI: RB23" -- e2e test` finds it), and this is that rewrite, made by a planner because the red was not one the list explains.

**How a second red is handled.** Any later CI red on RB23, on this pull request or after it, is never re-run and never rewritten again (clause 15 of `handbook/specs/settle-doctrine.md`; `handbook/specs/orchestration.md`, "While lanes run"). The implementer reads it as its definition says and hands it to the dispatcher with both readings: the two pasted in the dated issue comment this revision's build posts (Evidence) and the new run's. One the Mac and CI list explains (the line this revision adds included) goes to a fresh planner; one it does not is pulled out of the run under a new issue by the dispatcher's one entry `{ suite: "ribbon", step: "RB23", issue: <N> }` in `E2E_SKIPS` in `e2e/support/skips.ts`, which the implementer never writes since this plan does not name that file. With RB23 in its own step, nothing later in the suite needs a wait of its own first (clause 11's precondition): RB9 and RB10 read counts the suite took at its start.

### Alternatives rejected

- **Waiting for a frame between the two reads** (the house's shape for a script's tween, `stoppedWriting` and the frame counter `FRAMES` in `e2e/suites/home/drift.ts`): a frame is not enough here. In the trace with a frame counter (`432-r2-probe.log`, arm `frames counted`, `new`), the class came off at frame 36, `transitionrun` fired at frame 37 and `transitionend` at frame 39, and the poll at frame 38 still read the ground at paper with the transition pending; on the runner the transition stayed pending 67 to 183 ms, so any fixed count of frames is a bound fitted to one machine (clause 1). It also needs a `requestAnimationFrame` loop in the page, which keeps the page producing frames and so changes the timing it measures.
- **`makeStable`'s `animated: "#map"`**: a transition leaves the list when it ends, so the list is never non-empty and finished, and the wait times out (clause 3).
- **Departing on the ground's `transitionend`**: a retire that leaves the ground on starts no transition and fires none, so the check would fail by the wait's timeout instead of on "and lands whole" (clause 6), and a later rule that takes `#map` out of the blanket (`transition-property: none`, as `handbook/specs/cascade-traps.md` recommends for an element whose change must not lag) would time out a page that is correct.
- **Departing on the ground's colour**: it is the claim (clause 6).
- **Reading the inline declaration instead of the computed ground** (`#map`'s `style.backgroundColor` empty): it races nothing, but reads the mechanism instead of the resolved value, so a sheet rule that painted `#map` would pass it (`handbook/specs/cascade-traps.md`: pin the resolved value).
- **Dropping the ground from RB23's "and lands whole"** (call 19): kept; see the call.
- **A longer budget or more equal reads**: two reads 50 ms apart already fail on the runner, and any count of equal reads is a bet on how long the runner holds the start (clause 1).
- **Pulling RB23 out of the run now, under a flake issue**: the red is a defect in the check with a measured fix, and clause 15 sends a second red on a check rewritten once to that route, not a first.

## Files

### `e2e/suites/ribbon/ink.ts` (336 lines at bad72b76, 338 after)

The whole edit is the diff of `out/432-dry-run/ci/ink-G.ts` against `out/432-dry-run/ci/ink-base.ts` (the file at bad72b76), four hunks, each below; every line keeps its indentation as it stands.

- `type Ink` (lines 9 to 25): `groundAnims: number;` added after `rect: number[];` (line 24).
- `INK` (lines 26 to 31): its last line (31), `decoded: !p.hidden && p.complete && p.naturalWidth > 0, adds: w.adds, removes: w.removes, ends: w.ends.slice(), rect: [r.left, r.top, r.width, r.height] }; })()`;`, becomes `decoded: !p.hidden && p.complete && p.naturalWidth > 0, adds: w.adds, removes: w.removes, ends: w.ends.slice(), rect: [r.left, r.top, r.width, r.height], groundAnims: m.getAnimations().length }; })()`;`. `m` is already `document.getElementById("map")` in its first line. No regular expression, so no escaping applies.
- `reducedSwitch` (lines 301 to 305): line 304, `return stable(INK, "ribbon-ink-collapsed", { departed: (d) => d.ends.length > endsBefore });`, becomes `return stable(INK, "ribbon-ink-collapsed", { departed: (d) => d.ends.length > endsBefore && d.groundAnims === 0 });`. Nothing else in it changes.
- `rb23Reduced`: between line 328 (`    k.check(`) and line 329 (the label, `      "RB23 under reduced motion the first plate of a visit lands whole at once, ...`), one line at the label's indent, its date the day commit 7 is made in the form `2026-11-03`: `      // <that date>: rewritten for a red on CI: RB23, run 41719348554, Issue #432: the wait after the reduced-motion switch took two equal reads of #map's ground while its 0.01 ms transition was still pending, so it now departs only once #map lists no animation`. One line, never wrapped (the comment rule); `Issue #432` carries its word (`vellum/ts-comment-issue-form`); it cites no symbol by path, so `vellum/ts-comment-citation-resolves` has nothing to resolve.
- Nothing else in the file changes: RB23's label, its three faults, `NEAR_ZERO_S`, `WITNESS`, `turnAboutByHand`, `reducedArrival`, RB21 and RB22 stand as built. The planned file passes `npx prettier --check` as written (`432-r2-G-format.log`), so `npm run format` changes nothing in it.

### `e2e/suites/ribbon.ts` (230 lines at bad72b76, 231 after)

Lines 39 to 43, today

```ts
  await step("RB21 to RB23", async () => {
    const fullMs = await rb21InksIn(k);
    await rb22TurnAbout(k);
    await rb23Reduced(k, fullMs);
  });
```

become

```ts
  let fullMs = 0;
  await step("RB21, RB22", async () => {
    fullMs = await rb21InksIn(k);
    await rb22TurnAbout(k);
  });
  await step("RB23", () => rb23Reduced(k, fullMs));
```

No other line changes; the header comment already names what the checks do.

### `handbook/specs/settle-doctrine.md`

Two insertions, wrapped to the file's width (no prettier pass reads markdown), each imperative, citing `symbol` in `path`, with no provenance and no bare `#N` (`handbook/specs/conventions.md`):

1. In "The environment", the bullet opening "**A sleep past an animation's nominal duration still lands mid-animation.**" (lines 408 to 440 at bad72b76): after the sentence that ends at line 437 "`restSeeing` in `e2e/suites/chart-drawer/kit.ts` is the shape, the poll counting the class or the running animation on the way to `atRest`." and before the sentence opening "And this harness is Chromium only", insert:

   > A property that interpolates, a colour, a length or a transform, reaches the value a change gives it under reduced motion through a transition of the same near zero wherever `transition-property` is left at `all` (`handbook/specs/cascade-traps.md`, the bullet opening "Under reduced motion a change of style is a transition"); a property that does not interpolate, a `clip-path` going to `none`, changes at once. The element lists that transition in `getAnimations()`, pending at its start value with no start time until the browser starts it, which can be after its `transitionrun` and `transitionstart` have fired, and drops it once it ends, so two equal reads of the property can both be its old value, and its own events are no rest signal either; a check that reads such a property waits, after a departure that shows the change was made, until the element carrying it lists no animation, as `reducedSwitch` in `e2e/suites/ribbon/ink.ts` does for `#map`'s ground.

2. In "Where the Mac and the CI runner disagree", a new bullet directly after the one opening "**Speed: the runner is slower**" (lines 624 to 626 at bad72b76), before the one opening "**Strays:":

   > - **Transitions: under reduced motion a style change's transition is held at its start value longer on the runner**, through two of a wait's polls there where on a Mac it has ended by the next one, so a wait that takes two equal reads of the style for rest passes on a Mac and fails on CI. Home: the bullet above opening "A sleep past an animation's nominal duration", and the readings in `handbook/plans/400/432/432-r2-plan.md`.

   The path resolves from commit 7 on, which archives this plan there; `test/repo/prose-paths.test.ts` reads it (Evidence).

### Not edited, and why

`src/` (the ink-in is correct: the payload's class, clip and end), `src/styles/` (no rule moves; `#map` keeps the blanket's transition, which is what a reader under reduced motion gets), `e2e/support/settle.ts` (the wait is built from `makeStable` as it stands), `e2e/support/skips.ts` (nothing is pulled out), `test/` (no unit test changes), `.claude/skills/vellum-footguns/references/flake-record.md` (the two rows are the dispatcher's, on main from PR #1228, and their disposition is the dispatcher's to set: Rosters and doctrine).

## Tests, in the order they are written

No new check. RB23's wait is rewritten and the step it runs in is split; every claim, fault text and label stands. So there is no red-first test: the red is CI's own, at 034772b0 and bad72b76, and the readings below are the before and after.

### RB23, the step `"RB23"` in `e2e/suites/ribbon.ts`, written in `e2e/suites/ribbon/ink.ts`

**Its claims, unchanged:** under reduced motion the first plate of a visit lands whole at once with no reveal (RB21's inked arrival the control); a reveal running when reduced motion is switched on ends at once, its own end reporting under `NEAR_ZERO_S`; and it lands whole, with no class, no clip and no ground.

**The wait, as revised:** `stable(INK, "ribbon-ink-collapsed", { departed: (d) => d.ends.length > endsBefore && d.groundAnims === 0 })` inside `withReducedMotion` (through `underReduced`), `endsBefore` the `running` read's `ends.length`, taken with the run under way and no end recorded, so the departure does not hold at the switch (clause 5).

**Readings on the Mac** (`432-r2-probe.log`, part `rb23`; the branch's build `out/432-dry-run/branch/dist` from bad72b76; command `node out/432-dry-run/432-r2-probe.ts out/432-dry-run/branch/dist`, run from the revising planner's tree at ad2e2f59; `old` is the wait as built, `new` the revised one, each arm a fresh new-document witness, the stalls and mutations staged by injection, never by editing source):

- **Fixture, the revised wait** (arms `fixture 1` to `3` and `cpu throttled x20 1` to `3`, `new`): the accepted read `"cls":false,"clip":"none","ground":[0,1,1,0],"groundAnims":0,"ends":[0.00001]`, passing all three claims, six of six. Nearest its line: `fixture 1`, `new`, whose first poll after the end read the ground at paper with the transition pending, and whose wait went on to the next poll, transparent with nothing listed.
- **The witness that the wait now holds where the old one did not, staged** (arm `stall staged`: a `<style>` injected once the run is under way, `#map { transition-duration: 1500ms !important; transition-timing-function: steps(1, end) !important; }`, which beats the blanket's `*` by specificity and holds the ground at paper for 1.5 s after the retire, the CI red made long enough to see): the wait as built accepted `"ground":[243,233,207,255]` with the transition `running` at 16.7 and 66.7 ms of its 1500 in its two accepted polls, so RB23 failed "and lands whole" as CI did; the revised wait accepted `"ground":[0,1,1,0],"groundAnims":0` after `transitionend` (elapsed 1.5 s), passing.
- **Mutation (u), the plate never hears its end** (a second capturing `animationend` listener on the document, added after the witness's, stopping each `rb-ink` end there): the revised wait departed (`"groundAnims":0`, nothing transitions since nothing was retired) and accepted `"cls":true,"clip":"polygon(evenodd, ...","ground":[243,233,207,255]`, failing "and lands whole" on its claim, not by the wait's timeout.
- **Mutation (e, ground), the retire leaves the ground** (a new-document `MutationObserver` that writes `#map`'s inline `background-color: #f2e8cf` back when the class comes off, in the same task as the retire, so no transition starts): the revised wait departed (`"groundAnims":0`) and accepted `"cls":false,"clip":"none","ground":[243,233,207,255]`, failing "and lands whole" on the ground.
- **Witness, the run left to end on its own before the switch**: `"ends":[2.7]`, failing the end claim and only that, as r1's witness did.

**Readings on GitHub's machines** (the CI proof runner, run 41726439701, as The cause, measured, gives its command and files): the wait as built, the fixture's own instance, accepted `"ground":[242,232,207,255]` with the transition pending and failed "and lands whole" in 33 of its 50 samples, CI's red; the revised wait accepted `"ground":[0,0,0,0],"groundAnims":0` in 48 of 48, nearest its line `rb23-planned-wait-lane-5`'s RB23, which waited through the two pending polls the old wait accepts. The mutations below were not sent there: a red on its claim needs no runner, and the Mac reads them (next paragraph).

**Readings of the planned files themselves on the Mac**, the planned `e2e/suites/ribbon/ink.ts` and `e2e/suites/ribbon.ts` (`out/432-dry-run/ci/ink-G.ts` and `ribbon-G.ts`, this plan's Files exactly, marker included) copied into the branch's archive at `out/432-dry-run/branch/`, each mutation made by editing that archive's copy of the source and building it (`npm run build` there), never the repository, each run `VELLUM_E2E_SUITES=ribbon node e2e/run.ts` from `out/432-dry-run/branch/`; `npx tsc --noEmit`, `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` and `npx prettier --check` on the two files there all exit 0 (`432-r2-G-tsc.log`, `432-r2-G-lint.log`, `432-r2-G-format.log`):

- Fixture (`432-r2-G-ribbon.log`): `ALL PASS (28/28)`; RB23's `after` `"cls":false,"clip":"none","ground":[0,0,0,0],...,"ends":[0.00001],...,"groundAnims":0`.
- (e, ground), `clear`'s `els.ground.style.removeProperty("background-color");` deleted (`432-r2-G-mut-e.log`): `SOME FAILED (25/28)`, RB21 `"faults":["the plate lands whole: no class, no clip, no ground"]`, RB22 `"faults":["a lean mid-reveal lands the plate whole at once"]`, RB23 `"faults":["and lands whole"]`; no step's timeout.
- (u), the plate's `animationend` listener deleted (`432-r2-G-mut-u.log`): `SOME FAILED (25/28)`, RB21 on its landing and on the lift control, RB22 on the lean, RB23 `"faults":["and lands whole"]`; no step's timeout.
- (o), the exemption appended to the Ribbon sheet (`432-r2-G-mut-o.log`): `SOME FAILED (27/28)`, RB23 alone, `"faults":["reduced motion switched on mid-reveal ends the run at once: its own end reports under 10 ms"]`, `after` `"ends":[2.7],...,"ground":[1,0,1,0],...,"groundAnims":0`: the run ended on its own and the wait waited out the ground's transition before reading, so only the end claim fails.

**Mutations that must red once green** (Evidence carries the proof list), each by line on the branch at the revision's commit: **(u)** `src/site/ribbon/ink.ts`'s `animationend` listener deleted (`els.plate.addEventListener("animationend", ...)` to its closing `});`): RB23 reds on "and lands whole" with its wait departing, not timing out, and RB21 and RB22 red as the prover's row for (u) found (PR #1227 comment 6615205124); **(e, ground)** in `clear`, the line `els.ground.style.removeProperty("background-color");` deleted: RB23 reds on "and lands whole" (the ground), RB21 on its landing ("the plate lands whole: no class, no clip, no ground") and RB22 on its lean ("a lean mid-reveal lands the plate whole at once"); **(o)** the exemption `#rb-plate.rb-inking { animation-duration: calc(var(--rb-ink-strip) * var(--rb-strips, 3)) !important; }` added to the end of `src/styles/ribbon/index.css`: RB23 reds on its end claim alone, its wait departing at the run's own end. A row that reds RB23 by the step's timeout (the label `ribbon-ink-collapsed` in a `never reached its assertion` line) is NEEDS READ and a stop condition. **These are the implementer's to prove** (workflow step 15: a guard changed after the prover's round), on the CI proof runner, the reds named exactly.

### RB21 and RB22, the step `"RB21, RB22"`

Unchanged checks, each reading `INK` with the one more field. **What they read of the ground is not raced:** every ground they read is read at full motion, where `#map`'s `transition-duration` is `0s` and nothing on it transitions (`432-r2-probe.log`, part `styles`): RB21's print read and its landing, RB22's lean. RB22's picker and departure reads assert no ground. RB23's first claim reads a ground that was never set, since under reduced motion `begin` returns before it dresses the plate. **RB21's lift control** (`lifted`, `transform !== "none"` once the plate has landed) reads a 0.26 s transform transition at full motion by stillness alone, the same shape the old RB23 wait had, so the proof run traced it too (`432-r2-proof-lift.log`): its wait accepted the full lift, `matrix(0.999945, -0.0104718, 0.0104718, 0.999945, 0, -5)`, in 14 of 14 jobs. A lift still pending reads `matrix(1, 0, 0, 1, 0, 0)` (at the wait's first poll in all 14 traces, and at its first two in 7 of them), which would also pass `!== "none"`, but such a read exists only once a transition to the lift has begun; where the lift never comes back the plate's `:hover` rule holds `none` and nothing transitions, which is how mutation (u) reds the control (above). So the control cannot pass on a page with no lift, and it is not rewritten. Neither check is touched by this revision beyond the field.

### What each step holds

`handbook/specs/settle-doctrine.md`, "What a step holds" and "Who finds a slow step". **"RB21, RB22"** holds RB21's eight claims and RB22's four, none held by another browser check or a unit test (`git grep -n "rb-ink"` on main finds nothing), on one page; not thin. **"RB23"** holds three claims (the first plate whole at once under reduced motion; a running reveal collapses, its end under 10 ms; and lands whole), none held elsewhere (the `stage` and `slide-away` suites visit the Ribbon under reduced motion and read no ink-in state), on one page; not thin (the rule's thin is at most two claims held nowhere else). RB23 reads RB21's result, so for the slow rule the two steps count together, fifteen claims. So "Who finds a slow step" owes one reading of each step's seconds from the pull request's own CI run and decides nothing: "RB21, RB22" from RB20's result line to RB22's, "RB23" from RB22's to RB23's, in lane B's log. For scale, the red run at bad72b76 (`orch-1227-laneB.log`) read RB20 at 21:14:05.76, RB22 at 21:14:12.11 and RB23 at 21:14:14.44: RB23 2.3 s, which the revised wait lengthens by the one or two 50 ms polls it waits past the old wait's acceptance for the ground (it accepted 134 to 247 ms after the class came off on the runner).

## Order of commits

1. to 6. **Made, frozen**: f307a4b1, 74731a43, f9b3b5a8, 7b54e7c0, 034772b0, bad72b76.
7. **To make:** `#432 Revision 2: RB23 waits for the ground to rest after the reduced-motion switch, in a step of its own`: this plan copied unchanged from the scratchpad to `handbook/plans/400/432/432-r2-plan.md`, beside the frozen `432-plan.md` and `432-r1-plan.md` and over neither; `e2e/suites/ribbon/ink.ts` and `e2e/suites/ribbon.ts` as Files writes them. The commit body names the two red runs and that commits 1 to 6 stand as made. Then the local checks (Evidence).
8. **To make:** `#432 The settle doctrine names a transition's rest, and the runner's slower start`: `handbook/specs/settle-doctrine.md` as Files writes it. Then `npm test` (Evidence), then push, once, after commit 8, so CI runs once on the finished head (a push cancels a run still in progress for the pull request: the `concurrency` group in `.github/workflows/ci.yml`). Then the proof list (Evidence), the issue comment and the body.

No commit is amended, rebased, squashed or reverted; the branch is brought current with `git merge origin/main` only if main moves (workflow step 10). Commit before every mutation run (workflow step 8).

## Rosters and doctrine

- **No roster is joined.** No page, sheet, bundle, suite, lane or tier changes; the step split adds no check and no suite, and `test/e2e/lane-timings.test.ts` is not re-timed by a pull request (`handbook/specs/site-architecture.md`, "`MEASURED_SECONDS` is read from CI's own lane logs").
- **`handbook/specs/settle-doctrine.md`**: the two insertions under Files.
- **r1's design line is superseded, not edited**: `432-r1-plan.md` (Tests, RB23, step 3) says "Its stillness is what lets `#map`'s 0.01 ms transition off the ground land"; this revision supersedes it, and the frozen file stays as written (workflow step 8). The pull request body says so beside revision 2's difference.
- **The flake-record rows** for RB23 (two, on main since PR #1228 merged at bbb64b5f) are the dispatcher's to dispose: once this revision's head passes CI, their disposition reads settled by revision 2 of PR #1227, so they no longer count (clause 12). This revision's own proof run 41726439701 also reded RB23 on GitHub's machines, on purpose, at the defective head; whether it earns a row is the dispatcher's call (Calls made, the note after call 19). The implementer touches no row.
- **No other spec, gate or agent line is contradicted.** Clause 3 says a wait on a transition is written on its departure, which this one is; the environment bullet's "the reduced-motion arm waits on a rest signal too" is what it now does for the ground.

## Evidence

Run each command alone, in the implementer's tree, and name every one in the PR body:

- `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` until it passes): the lint holds `vellum/e2e-throw-inside-step` (both steps' waits inside a step), `vellum/e2e-sleep-inside-poll` and `vellum/ts-comment-issue-form` (the marker).
- After commit 7: `npm run build`, then `VELLUM_E2E_SUITES=ribbon npm run test:e2e`: the whole Ribbon suite green, 28 of 28 (the planned files read `ALL PASS (28/28)` on the Mac: `432-r2-G-ribbon.log`), RB21 and RB22 in the step `"RB21, RB22"` and RB23 in `"RB23"`, RB9 and RB10 last. Then `VELLUM_E2E_SUITES=prospect,ribbon npm run test:e2e`, lane B's order, once.
- After commit 8: `npm test`, the whole unit suite, then `npm run astro:generate` (the unit suite deletes the generated assets). No unit test changes, but the repo's prose tests read every tracked markdown file, `test/repo/prose-paths.test.ts` the doctrine's new backticked path among them, and they read the tracked files of a git tree, so the revising planner could not run them on the doctrine edit in its archive copy (they failed there on the listing itself, `432-r2-doctrine-tests.log`, which is no reading of the edit): UNVERIFIABLE before the build, and this run is the reading.
- **The CI proof runner**, at commit 8's head once pushed: write this list, unchanged, to the scratchpad as `432-r2-mutations.ts` (it compiles at bad72b76 with no error or warning through `buildList` in `scripts/proof-runner/send.ts`, `432-r2-dry-build.ts` beside it in the revising planner's `out/432-dry-run/ci/`, and this revision changes neither file it edits), then `npm run proof -- send <that path> --sha <the pushed head>` and, once the run has finished, `npm run proof -- read <run>`:

  ```ts
  // Issue #432 revision 2: the rewritten RB23 proved on the CI proof runner. Usage: npm run proof -- send <this file> --sha <the pushed head>
  export const MUTATIONS = [
    {
      id: "rb23-u-no-end-listener",
      edits: [
        {
          file: "src/site/ribbon/ink.ts",
          find: '  els.plate.addEventListener("animationend", (e) => {\n    if (e.animationName !== INK) return;\n    const running = els.plate\n      .getAnimations()\n      .some((a) => (a as CSSAnimation).animationName === INK && a.playState === "running");\n    if (!running) retire();\n  });\n',
          replace: "",
        },
      ],
      e2e: { suites: "prospect,ribbon", expect: ["RB21", "RB22", "RB23"] },
    },
    {
      id: "rb23-e-ground-kept",
      edits: [{ file: "src/site/ribbon/ink.ts", find: '  els.ground.style.removeProperty("background-color");\n', replace: "" }],
      e2e: { suites: "prospect,ribbon", expect: ["RB21", "RB22", "RB23"] },
    },
    {
      id: "rb23-o-exemption",
      edits: [
        {
          file: "src/styles/ribbon/index.css",
          append: "#rb-plate.rb-inking {\n  animation-duration: calc(var(--rb-ink-strip) * var(--rb-strips, 3)) !important;\n}\n",
        },
      ],
      e2e: { suites: "prospect,ribbon", expect: ["RB23"] },
    },
  ];
  ```

  Each row must read BITES and the control `control-e2e-1` CLEAN; the ledger, with its run id, goes in a PR comment with the line that these rows are the implementing session's proof of a check changed after the prover's round (workflow step 15). The Mac's readings of the same three (Tests) are what each row must match.
- **The pull request's own CI run** green in all seven jobs, lane B's log read for RB23's line (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), and the two steps' seconds read as "What each step holds" says, recorded in the PR body.
- **A dated comment on Issue #432**, before the PR body is updated: RB23 rewritten (its wait, its step, the marker), the `FAIL` line and the `fingerprint:` line of each failing job, job 126199216116 of run 41716916923 and job 126207684177 of run 41719348554, pasted from their logs (the issue holds them once the logs expire, `.claude/agents/vellum-implementer.md`), this plan's proof run 41726439701 with its readings in one line each (the wait as built 33 of 50 not whole on the runner, the revised wait 48 of 48 whole), and calls 15 to 19 copied in. The step 12 comment (6614446779) is never edited.
- **The PR body** names revision 2 and what it changes against revision 1 ("What this revision changes", items 1 to 4), the three proof rows, and that the rewrite is proven by the implementing session only and read by the dispatcher before the merge.
- `vellum-plate-reader` is not owed: nothing a reader sees changes. `vellum-guard-prover` and `vellum-pr-skeptic` are not dispatched again (their one round is spent: workflow step 15).

## Calls made

The implementer copies these into its dated issue comment.

15. **RB23's wait after the switch departs on the run's end and on `#map` listing no animation**, read in `INK` as `groundAnims` (revision 2). Rule: `handbook/specs/settle-doctrine.md` clauses 3, 5 and 6 (the wait names what shows the change, here the ground's transition in the only form a transition shows its rest, leaving its element's list; a departure read against the state the switch starts from; no part of the claim), and the environment bullet's "the reduced-motion arm waits on a rest signal". Taken because the stillness of two reads did not let the 0.01 ms transition land on GitHub's machines (The cause, measured), and because the frame count, `animated`, `transitionend` and the inline read each fail as Alternatives rejected says. Check design, the planner's to take, as calls 10, 13 and 14 were.
16. **RB23 runs in a step of its own**, `"RB23"`, after `"RB21, RB22"`, RB21's duration carried in a `let`. Rule: `handbook/specs/settle-doctrine.md` clause 11 (the step is the unit of the skip list) and clause 15 (a red on a rewritten check is pulled out, not re-run): the split keeps a later pull-out to RB23's three claims. Precedent: `svg1` across RB1 to RB5e and RB7 in the same suite.
17. **RB23 carries the rewrite marker**, though a planner wrote the rewrite and the red was not an explained one. Rule: the marker is what `.claude/agents/vellum-implementer.md` and `handbook/specs/orchestration.md` read to send a later red on a rewritten check down the never-twice route, and this is RB23's first rewrite for a red on CI; leaving it off would let a second red be re-run as a first.
18. **The settle doctrine records the runner's slower transition start**, one sentence in the environment bullet and one line in "Where the Mac and the CI runner disagree". Rule: that list's own opening ("A difference found later joins this list, in the change that records it, as one more line") and `handbook/specs/conventions.md`, "Where a rule lives" (the rule in the spec, the list pointing at it).
19. **RB23 keeps the ground in "and lands whole".** `#map`'s rect is the plate's, so a ground left on is hidden under a whole plate at rest and shows only when the plate lifts under the pointer (r1, finding 6); RB21's landing reads the same `clear` at full motion, and on today's code the ground conjunct of RB23 fails on no mutation that its class conjunct or RB21 does not also fail on (mutation (e, ground) reds all three checks). Kept anyway: it is half of what "lands whole" says a reader sees, the half that holds a retire which took the class off under reduced motion and left the paper behind, and it now reads at rest at no cost. Rule: this revision changes how RB23 waits and not what it claims (the Rulings line), and dropping a claim because its wait raced would be narrowing a check to fit the instrument (settle-doctrine clause 1: ask what the check is measuring before changing it); r1's call 14 named the claim.

**Not a call, the dispatcher's to rule:** the planner's proof run 41726439701 reded RB23 on GitHub's machines (its unpatched control `control-e2e-2` with CI's payload exactly, and the patched rows that keep the wait as built), sent on purpose at the defective head to measure a defect whose cause it then measured. Clause 12 counts a proof-runner run as a CI row, and the two rows on main make it the step's third if it is recorded, which would file an issue and skip the step. Whether it gets a row, and that row's disposition (a measurement of a measured defect, settled by this revision), is the dispatcher's; the planner and the implementer write no row.

## Open decisions

None. This revision's menu is empty: the fault is how RB23 waits (calls 15 to 17), and the doctrine it adds records a measured difference (call 18). It still stops at step 6, so Alex sees calls 15 to 19 before the build resumes.

## Stop conditions

Hand back, rather than adapt, when:

- The checkout of `feat/432-ink-in` reports the branch checked out in another worktree, or `git rev-parse HEAD` after taking it prints anything but bad72b7663dc4d9df53b42a14a1abcde2e1b2f78, or `git ls-tree -r --name-only HEAD -- handbook/plans/400/432/` lists anything but `432-plan.md` and `432-r1-plan.md`, or a line Files quotes is not at the line it names or not as written there.
- `git diff --stat bbb64b5f origin/main` touches `src/site/ribbon/`, `src/styles/ribbon/index.css`, `src/styles/shared/motion.css`, `e2e/suites/ribbon.ts`, `e2e/suites/ribbon/`, `e2e/support/settle.ts`, `e2e/support/step.ts`, `e2e/support/reduced-motion.ts` or `e2e/support/skips.ts`, or moves the two sections of `handbook/specs/settle-doctrine.md` this revision edits.
- **Locally, after commit 7:** any Ribbon check reds, in either local run, or RB23's `after` reads `groundAnims` other than 0, a ground alpha other than 0, or a wait timeout with the label `ribbon-ink-collapsed`.
- `npm test` after commit 8 reds anywhere, `test/repo/prose-paths.test.ts` on the doctrine's new path above all.
- **Any red on RB23 on GitHub's machines after commit 8 is pushed**, of any shape, on any run, the CI workflow's or the proof runner's (its control included): it is never re-run and never rewritten; hand it to the dispatcher with both readings (the dated issue comment's and the new run's), as "How a second red is handled" says. The same for a red on RB21 or RB22 that names the `groundAnims` field or a settle timeout in either.
- **A proof row** for (u), (e, ground) or (o) reads anything but BITES on exactly its expected reds, or reds RB23 by the step's timeout, or the run's control `control-e2e-1` is not CLEAN.
- The lint refuses the marker or the step names, or `e2e/suites/ribbon/ink.ts` passes 400 lines, or any function in it passes 50.
