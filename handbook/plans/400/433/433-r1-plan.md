# Issue #433, pull request 1, revision 1: one farthest-place walk for the atlas and the Ribbon

**Revision 1 of `433-plan.md`, and what it changes.** The cold skeptic's SHOULD-FIX on PR #1235 (relayed in the PR body's Records line): `defaultJourney` in `src/itinerary/route.ts` copies the loop of `farthestReachable` in `src/site/explorer/ribbon-job.ts` line for line, and only T1's five-seed parity links the two. This revision moves `farthestReachable` out of `ribbon-job.ts` into `src/itinerary/route.ts`, unchanged in name, parameters and body, and exports it; `defaultJourney` calls it in place of its own loop, and `ribbonResultFor` imports it in place of its private copy. Two new unit tests hold the walk itself (the longest road wins; on a tie, the place listed first wins), since T1 can no longer catch a change to the walk once both callers share it, and T1's own mutation becomes the wiring in `defaultJourney` (its candidate list), proven by the implementer. Against `433-plan.md` this revision supersedes: design item 1's "`ribbon-job.ts` is NOT edited"; the rejected alternative "Editing `ribbon-job.ts` to call `defaultJourney`: held read-only by the dispatcher" (still rejected, for the reason under **The design** below, but the walk is now shared); the Files line "Not edited: `src/site/explorer/ribbon-job.ts`"; and **Calls made** 12. Everything else in `433-plan.md` stands as built in commits 9266ddb4 to 91cf8ed6 and is not rebuilt.

**Planned at:** `origin/main` d73b108d141787f7095e315065857013fbb43bd1 (PR #1238, Issue #1218, merged while this was planned; the readings below were taken at ff67b785079bb8b400a87b5410a84c6f4585cf2e, and they hold at d73b108d because `git diff --name-only ff67b785 d73b108d` prints only `handbook/plans/1200/1218/1218-plan.md`, five files under `src/itinerary/dress/` and two dress tests, none of which the walk, `roadReachable`, the roads or `ribbonResultFor`'s choice of journey reads; `git merge-tree --write-tree origin/feat/433-ribbon-atlas-row d73b108d` exits 0, a clean merge), the branch `feat/433-ribbon-atlas-row` at 7158549eb3edb4e63312e3910c6ab8aedbcd46ad (`git ls-remote origin refs/heads/feat/433-ribbon-atlas-row`), the issue read at 10 comments (`gh api repos/ahl-gram/Vellum/issues/433/comments --paginate | jq length` printed 10: the re-baseline 5533804552, the deferral 5533954968, the rulings 6282029630 and 6282038151, the delegation 6619124326 and its extension 6619143522, the merge clearance 6619157358, the plan archive 6619486549, the implementer's calls 6619724388, and Alex's ruling on pull request 2's design round 6620144566, which bears on pull request 2 and on nothing here).

**Rulings:** none new. Alex's delegation of 2026-11-03 (issuecomment-6619124326, extended to every pull request in issuecomment-6619143522) takes the recommended option for every non-blocking question, and this revision's one question (share the walk, or keep the copy and file an errata row) is non-blocking: it amends no ratified ruling, it is no appearance, and an internal export is undone at no cost. So it appears under **Calls made**. The merge clearance (issuecomment-6619157358) is unchanged.

**Open decisions:** none.

## Specs

Read these before building, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/development-workflow.md`: step 8 (a revision is archived beside the plan it revises, as `handbook/plans/400/433/433-r1-plan.md`, in the first commit made for it) and step 15 (a guard added after the prover's round is proven by the implementing session and named so in the PR body).
- `handbook/specs/check-placement.md`: The unit suite (a unit test runs the code and asserts what it does; no test searches source text, so nothing here pins "ribbon-job.ts imports the walk" by reading the file).
- `.claude/skills/vellum-footguns/SKILL.md` Gate 1: item 2 (assert the precondition that makes the case non-trivial), item 18 (a selection rule is guarded on a consequence that differs by who was chosen, proved by inverting the selector) and item 21 (the existing witness in `test/site/ribbon-job.test.ts` stays beside the new ones).
- `handbook/specs/engine-invariants.md`: "A ribbon result substitutes a refused departure or destination without announcing it". It names `ribbonResultFor` and `roadReachable`, not the walk's home, so it stays true and is not edited.
- `handbook/specs/conventions.md`: the comment rules. This revision adds no comment; the dated measurement rides in an assertion message, the form `test/site/ribbon-job.test.ts` already uses.

## The design

**One walk, in the engine module both callers already import.** `farthestReachable(world, mask, from, reachable)` moves, byte for byte, from `src/site/explorer/ribbon-job.ts` (lines 84 to 100 at ff67b785) to `src/itinerary/route.ts`, after `roadReachable` and before `Journey`, and gains `export`. It keeps the longest `roadWalk` chain, compared with a strict `>` in `reachable`'s order, so the first place listed wins a tie. `defaultJourney` asks it for the capital's farthest place; `ribbonResultFor` asks it for the farthest place from whatever departure it resolved, exactly as it does today, its call site unchanged.

**Why share rather than keep the copy (measured, not argued).**

- **The parity test cannot see the copy drift on a tie.** None of T1's five seeds (3, 11, 42, 99, 2024) ties at the capital. Over seeds 1 to 60, the capital's longest road is tied on seeds 40 and 43 only, and the walk with `>` turned to `>=` sends seed 40's bare visit to Lulshootai (14) instead of Togkuukhot (13), and seed 43's to 20 instead of 19, while it returns the same place as the real walk on all five of T1's seeds. So today one copy could drift on its tie rule with every test green, and the atlas and the Ribbon would then disagree on seeds 40 and 43. Readings: `out/433-r1/433-r1-witness-probe.log`, below.
- **The read-only hold has no collision left to prevent.** Neither parallel branch (`feat/1229-ribbon-ink-soft-edge`, `fix/1218-ribbon-caption-keep-imports`) nor any open pull request touches `src/site/explorer/ribbon-job.ts`, `src/itinerary/route.ts`, `test/site/ribbon-job.test.ts` or `test/itinerary/route.test.ts` (`git diff --stat origin/main...origin/<branch>` for each; `gh pr list --state open` lists #1235 and #1238 only). The hold was the dispatcher's, not a ruling (recon claim 3), and the dispatcher's brief offers to lift it.
- **`farthestReachable` has one caller and no other reader.** It is module-private, called only by `ribbonResultFor` (`git grep -n farthestReachable origin/main -- src test test-support e2e scripts handbook/specs` prints `ribbon-job.ts:84` and `ribbon-job.ts:118` only), so the move widens no blast radius.
- **The house removes a copy by importing it.** Issue #1218's ruling (comment 6619920056, on that issue's road half-widths, cited by analogy only), and `ribbon-job.ts`'s own header, which says the glue is shared "so the two transports cannot drift apart".

**The Ribbon room draws the same roads, byte for byte.** The walk's text does not change, `ribbonResultFor` passes it the same four arguments, and `ribbonSvgFor` is a function of the `(fromIdx, toIdx)` pair the walk returns. Measured at ff67b785: over seeds 1 to 60, for every departure a road leaves (1,518 of them), `ribbonResultFor(world, { from: d, to: null, dress: "antique" }).toIdx` equals the moved walk's answer, 0 mismatches (`out/433-r1/433-r1-walk-probe.log`). No module enters any bundle: `ribbon-job.ts` already imports `src/itinerary/route.ts`.

**What each test holds afterwards.** W1 and W2 (new, in `test/itinerary/route.test.ts`) hold the walk: longest wins, and first listed wins a tie, each against an expectation derived from `roadWalk` lengths. T1 (unchanged) holds the wiring: that `defaultJourney` sets out from the same capital as the Ribbon's bare visit and offers the walk that capital's own `roadReachable` list. The existing "the fallback is the FARTHEST reachable road, not merely a reachable one" in `test/site/ribbon-job.test.ts` keeps holding longest-wins through `ribbonResultFor`, an instrument beside the new ones (Gate 1 item 21).

**Alternatives rejected, so none is rediscovered mid-build:**

- **Keep the copy and file a `handbook/errata/` row.** Rejected on the first measured bullet above: the copy's tie rule is unguarded today, so the row would record a known blind spot rather than a sibling defect nobody can fix.
- **Keep the copy and add seed 40 to T1's seeds.** It would catch a tie drift on seed 40, but it keeps two definitions of one rule and guards them on the seeds sampled; with one definition there is nothing to drift.
- **`ribbonResultFor` calls `defaultJourney`.** It cannot: it needs the farthest place from any departure (an explicit `a` with no `b`, a refused `b`), not only from the capital.
- **Export the walk from `ribbon-job.ts` and import it into `src/atlas/compose.ts`.** It would pull the site's job glue into the CLI's atlas, which `433-plan.md` already rejected for `ribbonResultFor`.
- **A new name for the moved function** (`roadFarthest`, to sit beside `roadMask`, `roadWalk`, `roadReachable`). A pure move keeps its name, so the call site in `ribbonResultFor` does not change and no reader has to map one name to another.

## Files

Edited (counts read with `wc -l`: `src/itinerary/route.ts` 80 lines on the branch, `src/site/explorer/ribbon-job.ts` 144, `test/itinerary/route.test.ts` 76; `git diff origin/main origin/feat/433-ribbon-atlas-row -- src/itinerary/route.ts` shows only the addition below line 59, and the other two files are identical on main and the branch):

- **`src/itinerary/route.ts`** (80 lines, 90 after). Insert after `roadReachable`'s closing brace (line 59) and before `export interface Journey`, with one blank line on each side:
  ```ts
  export function farthestReachable(
    world: World,
    mask: Uint8Array,
    from: number,
    reachable: ReadonlyArray<number>,
  ): number | null {
    let best: number | null = null;
    let bestLen = -1;
    for (const i of reachable) {
      const chain = roadWalk(world, mask, from, i);
      if (chain && chain.length > bestLen) {
        bestLen = chain.length;
        best = i;
      }
    }
    return best;
  }
  ```
  and `defaultJourney`'s body becomes:
  ```ts
  export function defaultJourney(world: World): Journey | null {
    const capital = world.settlements.findIndex((s) => s.kind === "capital");
    if (capital < 0) return null;
    const mask = roadMask(world);
    const best = farthestReachable(world, mask, capital, roadReachable(world, mask, capital));
    return best === null ? null : { fromIdx: capital, toIdx: best };
  }
  ```
  `Journey` and the signature of `defaultJourney` are unchanged, so `src/atlas/compose.ts` and pull request 2's planner need nothing.
- **`src/site/explorer/ribbon-job.ts`** (144 lines, 126 after). Delete lines 84 to 101 (the private `farthestReachable` and the blank line after it), so the blank line 83 is followed by `export function ribbonResultFor`. Line 7 becomes exactly:
  ```ts
  import { farthestReachable, roadMask, roadReachable } from "../../itinerary/route.ts";
  ```
  (`roadWalk` leaves the import: its only use in the file was inside the deleted copy, and the lint reds an unused import.) The call `farthestReachable(world, mask, fromIdx, reachable)` in `ribbonResultFor` (line 118 at ff67b785) is not edited.
- **`test/itinerary/route.test.ts`** (76 lines, about 110 after). Line 4 becomes `import { farthestReachable, roadMask, roadReachable, roadWalk } from "../../src/itinerary/route.ts";`, and W1 and W2 (**Tests**) are appended at the end of the file.

Not edited: `test/itinerary/default-journey.test.ts` (T1 to T3 stay as written), `test/site/ribbon-job.test.ts` (nothing in it names the private function: `git grep -n farthestReachable -- test` prints nothing at ff67b785), every other file of the branch, any spec, anything under `src/world/`, `src/itinerary/dress/` (Issue #1218's lane), `src/site/ribbon/` and `e2e/suites/ribbon/` (Issue #1229's lane). No file passes 400 lines and no function 50.

**Shared with a parallel lane:** none, measured above. `src/site/explorer/ribbon-job.ts` is this pull request's file from this revision on.

## Tests, in the order they are written

Both are written in commit A against the stub below and red on their assertions. No browser check is added or changed, so no browser readings are owed. Readings below were taken at ff67b785 by `out/433-r1/433-r1-witness-probe.ts` in this planner's tree (command `node out/433-r1/433-r1-witness-probe.ts > out/433-r1/433-r1-witness-probe.log`), which runs the moved walk, the stub and each mutation over the two fixtures exactly as the tests read them; `route.ts`'s `roadMask`, `roadWalk` and `roadReachable` are the same on main and the branch, so the readings hold on the branch.

**The stub of commit A** (right shape, wrong behaviour: the shortest road wins, the last listed on a tie). In `src/itinerary/route.ts`, at the place **Files** gives, the exported function with this body, `defaultJourney` and `ribbon-job.ts` not yet touched (so `ribbon-job.ts` keeps its own private copy for one commit, which collides with nothing, since it does not import the stub):
```ts
  let best: number | null = null;
  let bestLen = Infinity;
  for (const i of reachable) {
    const chain = roadWalk(world, mask, from, i);
    if (chain && chain.length <= bestLen) {
      bestLen = chain.length;
      best = i;
    }
  }
  return best;
```

**W1** `test/itinerary/route.test.ts`, "farthestReachable keeps the place whose road is longest, wherever it stands in the list (Issue #433)". On the file's own seed 42 `world`, `mask` and `capital`:
```ts
  const reachable = roadReachable(world, mask, capital);
  const lens = reachable.map((i) => roadWalk(world, mask, capital, i)?.length ?? -1);
  const longest = lens.indexOf(Math.max(...lens));
  assert.equal(longest, lens.lastIndexOf(Math.max(...lens)), "the witness: one place alone ends seed 42's longest road from the capital");
  assert.ok(longest > 0 && longest < reachable.length - 1, "and it stands neither first nor last in the list, so the walk is what picks it");
  assert.equal(farthestReachable(world, mask, capital, reachable), reachable[longest]);
```
- Readings: 24 places reachable from the capital (0, Laukuwelua); the longest road is 167 cells, to place 22 (Homaitani), at list position 21, unique; the first listed is 1 and the last 25. The moved walk reads 22: passes.
- The stub reads 23 (the shortest road, 10 cells): red on the last `assert.equal`, `actual: 23, expected: 22`.
- Mutations once green (by line, on `if (chain && chain.length > bestLen) {` in `src/itinerary/route.ts`): `>` turned to `<` reads `null`, red; the line turned to `if (chain) {` (the last walkable place kept) reads 25, red; the loop returning its first walkable place reads 1, red (that one is read by the probe; the implementer proves the first two). Under `>` turned to `>=`, W1 reads 22 and stays green, by design: a unique longest road is indifferent to the tie rule, which is W2's.

**W2** same file, "farthestReachable keeps the first listed of the places tied on the longest road (Issue #433)":
```ts
  const world40 = generateWorld(defaultRecipe(40));
  const mask40 = roadMask(world40);
  const capital40 = world40.settlements.findIndex((s) => s.kind === "capital");
  const reachable = roadReachable(world40, mask40, capital40);
  const lens = reachable.map((i) => roadWalk(world40, mask40, capital40, i)?.length ?? -1);
  const max = Math.max(...lens);
  const first = lens.indexOf(max);
  assert.notEqual(first, lens.lastIndexOf(max), "the witness, measured 2026-11-03: Togkuukhot (13) and Lulshootai (14) tie at 109 cells from seed 40's capital");
  assert.equal(farthestReachable(world40, mask40, capital40, reachable), reachable[first]);
```
- Readings: 18 places reachable from seed 40's capital (0, Ghul); the longest road is 109 cells, reached by exactly two places, 13 (Togkuukhot) at list position 7 and 14 (Lulshootai) at position 8. The moved walk reads 13: passes. Seed 40 is the lowest seed in 1 to 60 whose capital ties (the other is 43).
- The stub reads 3: red on the last `assert.equal`, `actual: 3, expected: 13`.
- Mutation once green: `>` turned to `>=` on the same line reads 14, red, `actual: 14, expected: 13`; this is the mutation W1 cannot see and T1's five seeds cannot see either (it returns their real answers on all five). `>` turned to `<` reads `null` and `if (chain) {` reads 25, both red.

**T1's proof moves with the walk.** The prover proved T1 by inverting the comparison inside `defaultJourney`'s own loop, and the PR body's T1 row says so. After commit B that line lives in `farthestReachable`, where a mutation moves both sides of T1's parity at once (under `>=` T1 stays green; under `<` `ribbonResultFor` throws before the `deepEqual`), so T1's code changed after the prover's round and it owes a proof of its own (workflow step 15). Its mutation is now the wiring: on `defaultJourney`'s new line, the candidate list cut to its first entry, `roadReachable(world, mask, capital).slice(0, 1)`. T1 then reds on seed 3, the first of its seeds, on the `deepEqual`: `actual: { fromIdx: 0, toIdx: 1 }, expected: { fromIdx: 0, toIdx: 15 }` (seed 3's farthest place is 15 and its first reachable place 1; read at ff67b785 by `out/433-r1/433-r1-t1-slice-probe.ts`, command `node out/433-r1/433-r1-t1-slice-probe.ts > out/433-r1/433-r1-t1-slice-probe.log`, which runs the walk over the cut list: T1's precondition passes on all five seeds and the mutated journey fails the `deepEqual` on all five, toIdx 1 against 15, 23, 22, 17 and 20). T1's test text is not edited.

**Who proves what.** `vellum-guard-prover`'s one round on this pull request is spent (it proved 14ec2baa), so W1, W2 and T1's new mutation are proven by the implementing session, as workflow step 15 says, and the PR body names them "proven by this session only". After commit C is pushed, and with nothing uncommitted (commit before you mutate), four runs, each followed by `git checkout -- src/itinerary/route.ts`:
1. `if (chain && chain.length > bestLen) {` in `farthestReachable` with `>` turned to `>=`; `npm test -- test/itinerary/route.test.ts`; expect W2 red and W1 green.
2. The same line with `>` turned to `<`; the same command; expect W1 and W2 red.
3. The same line turned to `if (chain) {`; the same command; expect W1 and W2 red.
4. `defaultJourney`'s line `const best = farthestReachable(world, mask, capital, roadReachable(world, mask, capital));` with `roadReachable(world, mask, capital)` turned to `roadReachable(world, mask, capital).slice(0, 1)`; `npm test -- test/itinerary/default-journey.test.ts`; expect T1 red on seed 3 as above, and T2 and T3 green.

Paste each red line into the guard table.

## Order of commits

The implementer resumes on the pushed branch (`git fetch origin feat/433-ribbon-atlas-row`, then `git checkout -B feat/433-ribbon-atlas-row origin/feat/433-ribbon-atlas-row`, each as its own command, once the dispatcher says the tree that held it is retired), and adds a merge and three commits after 7158549e, pushing each:

- **The merge.** `git merge origin/main` (never a rebase, workflow step 10), which brings in d73b108d (Issue #1218's dress change) cleanly, as measured; nothing else in this revision depends on it, and it puts every later run on the combined state.
- **A.** `#433 Revision 1: the farthest-place walk gets witnesses of its own, red against a stub`. This plan copied unchanged from the scratchpad to `handbook/plans/400/433/433-r1-plan.md` (beside `433-plan.md`, which is not edited), the stub export in `src/itinerary/route.ts`, W1 and W2 in `test/itinerary/route.test.ts`. W1 and W2 red on their assertions; every other test green.
- **B.** `#433 farthestReachable moves into route.ts, and defaultJourney walks with it`. The stub's body replaced by the moved body, `defaultJourney` calling it. W1, W2 and T1 to T3 green.
- **C.** `#433 The Ribbon job imports the one farthest-place walk instead of keeping a copy`. `ribbon-job.ts`'s copy deleted and its import line changed, as **Files** gives. Everything green.

CI on commit A is expected red, on W1 and W2 alone, and is not a hand-back; the CI run that counts is the one on the head after commit C. Then the four mutation runs above, the **Evidence** commands, and the PR body and issue comment edits below. Run `npm run format` before each commit; the layout it writes (it wraps W1's and W2's long `assert` lines) is what lands.

## Rosters and doctrine

- **Rosters joined:** none. No page, sheet, bundle, suite, lane, discovery route or roster entry changes.
- **Doctrine contradicted:** none. `handbook/specs/engine-invariants.md`'s "A ribbon result substitutes..." names `ribbonResultFor`, which still does the substituting, and `roadReachable`, which does not move. No spec names `farthestReachable` (recon claim 2). `handbook/plans/400/428/428-plan.md` cites `farthestReachable` in `ribbon-job.ts`; it is an archived plan, never edited, and outside the roots `test/repo/prose-paths.test.ts` walks.
- **Errata:** no row. Nothing found is left unfixed.
- **Comments:** none added.
- **Golden and regen:** none owed; no world, chart or committed file changes.

**The PR body (#1235), edited after commit C:**

- The paragraph opening "Nothing here touches `src/world/`" gains the sentence: "`src/site/explorer/ribbon-job.ts` loses its private copy of the farthest-place walk and imports the one `src/itinerary/route.ts` now exports (revision 1); the Ribbon room draws the same roads."
- The Plan line becomes: "Plan: `handbook/plans/400/433/433-plan.md` (archived unchanged) and its revision 1, `handbook/plans/400/433/433-r1-plan.md`, which moves the farthest-place walk (`farthestReachable`) from `src/site/explorer/ribbon-job.ts` into `src/itinerary/route.ts` unchanged, so `defaultJourney` and the Ribbon job share one walk, and adds two witnesses for the walk itself (the cold skeptic's SHOULD-FIX)." followed by the existing sentence about main moving under the branch, extended to say main moved again to d73b108d (Issue #1218's dress change, no file this plan names), merged in, and the full suite ran on the combined state.
- The guard table gains two rows: W1 (`farthestReachable` keeps the longest road, seed 42) and W2 (the first listed wins a tie, seed 40), each with the stub's red line from commit A and the mutation red lines from runs 1 to 3, marked "proven by this session only".
- T1's row is rewritten: its mutation becomes run 4's (the candidate list cut to its first entry), with run 4's red line, marked "proven by this session only", and the row says its old mutation (the comparison inverted) now lives in `farthestReachable` and is W1's and W2's.
- The Ran line names the revision's unit files and the whole-suite count on the new head.
- The Records line's `vellum-pr-skeptic` entry: its SHOULD-FIX went back to the planner and is fixed by revision 1 (commits A, B and C by sha); the two NITs stay left as written.

**The issue record:** one new dated comment on Issue #433, "Calls made building revision 1 of pull request 1", pointing at this revision's **Calls made** through the dispatcher's plan archive comment for `433-r1-plan.md`, and naming any execution detail the plan was silent on. The comment 6619724388 is not edited.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test -- test/itinerary/route.test.ts test/itinerary/default-journey.test.ts test/site/ribbon-job.test.ts test/site/ribbon-fallback-note.test.ts test/render/place-manifest.test.ts test/itinerary/event-seats.test.ts test/atlas/compose.test.ts test/site/app-bundles.test.ts` at commit C, green; then the whole `npm test` once on the head; then `npm run astro:generate` (the unit suite deletes the generated assets). Check `ps` for another lane's suite first and wait for it.
- `git grep -n farthestReachable -- src test test-support e2e scripts` at commit C prints exactly: its definition and `defaultJourney`'s call in `src/itinerary/route.ts`; the import and the call in `src/site/explorer/ribbon-job.ts`; the import and W1's and W2's calls in `test/itinerary/route.test.ts`.
- The four mutation runs' red lines (above).
- The e2e suites the change touches: `ribbon` (its worker's walk moves, byte for byte) and `print-room` (the atlas row, whose journey `defaultJourney`'s new body names). At commit C, `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room,ribbon npm run test:e2e`, once, alone, after `ps` shows no other lane's suite running (`print-room` needs `hunt` before it; `ribbon` needs no predecessor and does not open on home). CI runs every lane on the new head. The full local lanes are not run.
- `vellum-plate-reader` is not owed: nothing a reader sees changes.
- CI green on the new head, every lane; the merge clearance's terms (issuecomment-6619157358) then apply.

## Calls made

Each taken under Alex's delegation of 2026-11-03 (issuecomment-6619124326, extended in issuecomment-6619143522); none is blocking.

1. **Share the walk; do not keep the copy and file an errata row.** `ribbon-job.ts` becomes this pull request's file, the dispatcher's read-only hold lifted. Rule: measured, T1 is blind to a tie-rule drift between the copies (none of its five seeds ties at the capital; seeds 40 and 43 do, and a `>=` copy changes their bare-visit road with every test green); the hold's reason, a collision with the Ribbon lanes, measured absent; and the house removes a copy by importing it (`ribbon-job.ts`'s header; Issue #1218's ruling by analogy). Overrule option: keep the copy, add seed 40 to T1, and file the errata row.
2. **A pure move:** the same name, `farthestReachable`, the same parameters (`from`, not `fromIdx`) and the same body. Rule: workflow step 15, a move stays a move; the call site in `ribbonResultFor` does not change.
3. **Its home is `src/itinerary/route.ts`**, beside the `roadWalk` and `roadReachable` it composes. Rule: both callers already import that module, and `433-plan.md` already rejected the atlas importing site glue.
4. **The witnesses live in `test/itinerary/route.test.ts`**, on seed 42 (longest wins) and seed 40 (the first listed wins a tie), each expectation derived from `roadWalk` lengths with its precondition asserted. Rule: Gate 1 items 2 and 18; seed 40 is the lowest of seeds 1 to 60 whose capital ties.
5. **T1 stays as written**, its seeds not widened, and is described as holding the wiring. Rule: with one definition there is no copy for parity to catch; touch only what the finding needs.
6. **The existing ribbon-job witness stays.** Rule: Gate 1 item 21.
7. **One local e2e run, `hunt,print-room,ribbon`, at commit C.** Rule: workflow step 10 owes the e2e suites the change touches, and the Ribbon's worker code and `defaultJourney`'s body both change; the move is measured to have no browser-visible effect (0 mismatches over 1,518 departures), so the run confirms rather than probes.
8. **W1, W2 and T1's new mutation proven locally by the implementer**, not by the prover. Rule: workflow step 15 (one prover round per pull request, spent on 14ec2baa; a guard whose code changed after it, as T1's did, is proven by the implementing session).

## Stop conditions

Hand back, with the command and what it printed, when:

- `git ls-remote origin refs/heads/feat/433-ribbon-atlas-row` prints a head other than 7158549eb3edb4e63312e3910c6ab8aedbcd46ad before the merge, or `git diff --stat ff67b785 origin/main -- src/itinerary/route.ts src/site/explorer/ribbon-job.ts test/itinerary/route.test.ts test/site/ribbon-job.test.ts src/world src/society` prints any file, or `git merge origin/main` stops on a conflict.
- At commit A, W1 or W2 is green against the stub, or red on a precondition rather than on its last `assert.equal`.
- W1's precondition fails (seed 42's longest road from the capital is not one place's alone, or that place is first or last in the list), or W2's fails (seed 40's capital has no tie on its longest road), locally or on CI.
- After commit B or C, any test in `test/itinerary/default-journey.test.ts`, `test/site/ribbon-job.test.ts`, `test/site/ribbon-fallback-note.test.ts`, `test/render/place-manifest.test.ts`, `test/itinerary/event-seats.test.ts` or `test/atlas/compose.test.ts` reds: the move was not byte for byte.
- The `>=` run does not red W2, or reds W1; or the `<` or `if (chain) {` run leaves W1 or W2 green; or the `.slice(0, 1)` run leaves T1 green, or reds it on a seed other than 3 or on its precondition.
- `npm run lint` or `npm run check` reports anything in `src/itinerary/route.ts` or `src/site/explorer/ribbon-job.ts` beyond what `npm run format` fixes.
- The `git grep` under **Evidence** prints any file other than the three it names.
- A `ribbon` or `print-room` check reds on CI on the new head (read and routed as `.claude/agents/vellum-implementer.md`, "When to hand back", says).
