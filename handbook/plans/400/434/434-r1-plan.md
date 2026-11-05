# Plan: Issue #434, revision 1

**Revision 1 of `434-plan.md`**, written for the implementer's hand-back of 2026-11-04 on `feat/434-journal-road` at d9f69b47a2588d1e78934b435ddbd1de40d91898. It changes four things against `434-plan.md`:

1. **A roster is joined.** The press's gold hover joins `TIPPING_LINKS` (C24). That replaces "Rosters joined: none", which was false.
2. **The `forget` path is settled.**
   - `createQuestion`'s `forget` is deleted (C25).
   - T5's rebuild clause is deleted (C26).
   - A new test, T10, pins the rest of the path (C27).
   - These replace T5's clause 7 and its `forget` mutation, which were false.
3. **The plan's text is corrected to what was built**: departures B2, B3, B5, B6 and B7, T1's red site, the line counts, and the `closeIfUntold` assertion the implementer added after the prover's round.
4. **A keyboard reader's view of a pale press is measured** (C28). It is a note for Alex, not a change.

**Everything else in `434-plan.md` stands as written, and is built at d9f69b47.** This revision does not re-plan it.
- Where a section below says it replaces a section of `434-plan.md`, it replaces that section whole.
- Where it says it corrects one, it changes only the lines it names.

**Planned at**: `origin/main` ec4f4289ee89cb0d56b55b324806740dcccb6e1b, and the issue read at 10 comments (`gh api repos/ahl-gram/Vellum/issues/434/comments --paginate | jq length`). The branch head was read at d9f69b47 (`git ls-remote origin refs/heads/feat/434-journal-road`).
- Main moved from 7200fdbb, where `434-plan.md` was planned, by one commit: ec4f4289, PR #1242 (Issue #450).
- That commit touches no file this issue touches. `git diff --stat 7200fdbb origin/main -- <every file the branch changes, plus handbook/errata/guards.md>` prints nothing.

**Rulings**: the four comments `434-plan.md` lists, unchanged: 6643897113, 6643975537, 6645742777 and 6645788043. No ruling was taken for this revision.

**Open decisions**: none.

**How the readings were taken.** Every reading below is new to this revision.
- **The planner's tree** is `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-ade68a0c0937967e4/`.
  - It was switched detached to d9f69b47 for each run, then back.
  - Each test probe was removed from the tree after its run.
- **The `forget` mutants on the built tests**:
  - harness `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/434-r1-forget-mutants.ts`;
  - log `434-r1-forget-mutants.log` beside it;
  - run as `node <harness> <tree>`;
  - it runs `npm test -- test/site/reading-frame-log.test.ts` under each mutant and restores the file after each.
- **T10 under each mutant**:
  - harness `434-r1-pin-mutants.ts`, log `434-r1-pin-mutants.log`;
  - the test it ran, as this plan writes T10: `434-r1-pin-probe.test.ts`;
  - all three in the same scratchpad folder, run the same way, with T10 placed as `test/site/434-r1-pin-probe.test.ts` beside the built test file.
  - That probe test passed `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0`, `npx prettier --check` and `npx tsc --noEmit`.
- **The keyboard focus reading**:
  - probe `out/434-dry-run/434-r1-focus-probe.ts`, run as `node out/434-dry-run/434-r1-focus-probe.ts`;
  - log `out/434-dry-run/434-r1-focus.log`;
  - on the site `npm run build` made from d9f69b47 (`out/434-dry-run/434-r1-build.log` and `434-r1-build.sha`), with no staging;
  - the stills and their page are in `out/434-r1-focus/`.
- **The line counts**:
  - `npx eslint --flag unstable_native_nodejs_ts_config --rule '{"max-lines": ["error", {"max": 1, "skipBlankLines": true, "skipComments": true}]}' src/site/reading-room/app.ts src/site/shared/living-chart/voyage-log-panel.ts` at d9f69b47;
  - log `434-r1-maxlines.log` in the scratchpad.
- **Copies of every scratchpad file named above**, the two harnesses, their logs, the T10 probe test and the line-count log, sit in the planner's tree at `out/434-dry-run/` beside the focus probe. They travel with that folder.
- **RV8b and RV8c are unchanged by this revision**, and it quotes none of `434-plan.md`'s readings for them.
  - Their built evidence is the implementer's: `room-voyage-route` 18/18, and each listed mutation red on its own rebuild (the hand-back, `main-434-handback.md` in the scratchpad).

## Specs

These come on top of `434-plan.md`'s list, which stands:

- `CLAUDE.md`, "Process":
  - "Zero red from the prover is a hole, not a pass. A guard proved unable to bite is deleted rather than shipped" (C26);
  - "A guard proves it can fail" (C27).
- `handbook/specs/ui-design.md`, "Gesture": a tip promises the surface goes somewhere, and a new tip joins one of the lists consciously (C24).
- `handbook/specs/check-placement.md`, "The unit suite" (T10).
- `handbook/specs/development-workflow.md`:
  - step 8, the revision archived beside the plan it revises;
  - step 10, the combined state with main;
  - step 12, a new comment and never an edit;
  - step 15, a guard added after the prover's round is proven by the implementing session.
- `.claude/skills/vellum-footguns/SKILL.md`:
  - Gate 1 before T10;
  - Gate 5 at the push and the body.

## The design

**Unchanged.** Only the engine's `forget` path changes:
- `createQuestion` no longer has a `forget` of its own.
- `createRoadAsk`'s `forget` keeps only `seats = []`, called from `buildLogPanel` and `hideLog` as built.

The behaviour is identical:
- T1 to T5 stay green with the deletion (`434-r1-pin-mutants.log`, row R1).
- No browser check reads the question across a rebuild.

### Alternatives rejected in this revision

- **Keep `createQuestion.forget` as hygiene, and name it in the PR body as an equivalent mutant.**
  - The line holds nothing that matters. `asks` compares by identity, so a seat left in `asking` is never matched again.
  - The next `close()` drops it anyway. The next press runs `close()`, and so does the engine's `closeAsk` on each paint of the position.
  - Shipping it would put an unproven line in the pull request to record a release that already happens (C25).
- **Keep T5's rebuild clause.** No single change to the shipped code reds it (C26).
- **Delete `seats = []` and the two `ask.forget()` calls as well, since no test saw them either.**
  - `seats = []` bears load. Without it, `settle` repaints every road press of every journal drawn in the sitting, on every reveal, and keeps them all in memory.
  - So these lines are pinned (C27), not deleted.
- **Record `hideLog`'s `ask.forget()` as unproven in `handbook/errata/guards.md`**, on PR #867's pattern. T10's hide clause makes it bite (F4 red), so no line is left unproven and no row is owed.
- **`CHART_INSTRUMENTS` or `TIPS_AWAITING_A_RULING` for the hover** (C24).

## Files

Line counts are at d9f69b47, written as `wc -l` / the lint's `max-lines` count (skipping blank and comment lines).

### `src/site/shared/living-chart/voyage-log-panel.ts` (242 / 209)

**Corrections to `434-plan.md`'s text**, built this way and kept:
- **`roadPressParts`** sets the address with `press.setAttribute("href", href)` (B5).
- **`paintSeat`** writes through destructured locals, because `no-param-reassign` (props: true) refuses a property write on a parameter (B2):

  ```ts
  const { press, note, row } = s;
  const told = row.classList.contains("inked");
  press.setAttribute("aria-disabled", String(!told));
  note.hidden = told;
  ```

- **`createQuestion`'s `open`** writes the same way: `const { label } = s; label.textContent = ROAD_ASK; asking = s;` (B2). `close()` writes `asking.label.textContent` directly, since `asking` is a local and not a parameter.
- **The size estimates are corrected**: the file is 209 lines to `max-lines`, not the planned "about 190". Every function stays under 50, as `npm run lint` at d9f69b47 says.

**This revision's edit (C25).** In `createQuestion`'s returned object, delete

```ts
    forget(): void {
      asking = null;
    },
```

and in `createRoadAsk`, replace

```ts
  function forget(): void {
    seats = [];
    q.forget();
  }
```

with

```ts
  function forget(): void {
    seats = [];
  }
```

- `createQuestion` then returns `{ asks, open, close, closeIfUntold }`.
- `buildLogPanel` and `hideLog` keep their `ask.forget()` calls.
- Nothing else in the file changes.

### `scripts/lint/sheet-motion.ts` (224 at 7200fdbb, 225 after)

`TIPPING_LINKS` gains one line, appended last, as built in 40596d90 (C24):

```ts
  "shared/reading-frame.css :: .rf-log-strip li.prologue .cr-road:is(:hover, :focus-visible)",
```

There is no comment at the entry (C24).

### `test/site/reading-frame-log.test.ts`

**As built at d9f69b47, with three edits:**

1. **T5's rebuild clause is deleted (C26).** These four lines at the end of T5's body, and the blank line before them, are removed:

   ```ts
     const rig = await askingRig();
     const { rows: fresh } = rig.panel.buildLogPanel(ROAD_PORTS, 1200, 42, "x", HOME, ROAD_LEGS);
     rig.panel.revealLog(fresh, 5);
     assert.equal(click(press2(fresh)).defaultPrevented, true, "a rebuilt row asks before it goes");
   ```

2. **T5's name loses its rebuild.**
   - It was "the question closes on any other action: focus leaving, Escape, another road asking, a pale press pressed, its row untold, the engine's closeAsk, and a rebuild (#434 M4)".
   - It becomes "the question closes on any other action: focus leaving, Escape, another road asking, a pale press pressed, its row untold, and the engine's closeAsk (#434 M4)".
3. **T10 is appended after T5** (below, C27).

### `src/site/reading-room/app.ts` (405 / 337)

- **As built.**
- **`434-plan.md`'s "400 or fewer after" is corrected.** The bound is the lint's `max-lines`, 400 skipping blanks and comments, as its own stop condition said. The lint counts 337, where `wc -l` gives 405.

### `test/site/ribbon-job.test.ts`

**As built.** T9 reads a caught value through `errorText` from `src/site/shared/error-text.ts`, because `vellum/no-error-cast` refuses `(e as Error)` (B6). That edit rode in commit 40596d90.

### `e2e/suites/room-voyage-route/road-press.ts`

**As built.** RV8c's `PLAY_RECT` scrolls Play into view with `scrollIntoView({block:"nearest"})` before reading its rect, then presses it with `sendClick`. The check reads the press's state in one `STATE` evaluate, shared by its settles and its final read (B7). Nothing it asserts changes.

### `handbook/plans/400/434/434-r1-plan.md` (new)

This file, copied unchanged from the scratchpad, beside `handbook/plans/400/434/434-plan.md`, which stays as it is.

## Tests

### T1: a correction

- **The red site.** The mutation `legs[i - 1]` → `legs[i]` reds at "row 1 carries no press", not at row 2's `href`. Row 1 then reads `ROAD_LEGS[1]`, a road, and the loop over rows 0, 1 and 4 runs first. It still reds.
- **The address read.** It goes through `getAttribute("href")` (B5).

### T3: a correction

The mutation written as `s.note.hidden = told` → `s.note.hidden = false` is, as built, `note.hidden = told` → `note.hidden = false` (B2).

### T5: replaces `434-plan.md`'s T5

**Name**: "the question closes on any other action: focus leaving, Escape, another road asking, a pale press pressed, its row untold, and the engine's closeAsk (#434 M4)"

**Fixture**, as built (B3):
- **`askingRig()`** builds a fresh `roadPanel(park)`, runs `revealLog(rows, 5)`, presses row 2 once, and asserts it asks "Leave the voyage?".
- **`assertClosedNotRelabelled(rig, why)`** runs `revealLog(rows, 5)`. It then asserts:
  - row 2 reads "Take this road";
  - a fresh first press on it is prevented;
  - that press calls `park` once more.
- **`CLOSERS`** is six named closers, each run on its own rig:
  1. "focus leaves the press";
  2. "Escape is pressed on it";
  3. "another road press asks", in which row 3 asks in its turn;
  4. "a pale press is pressed", after `revealLog(rows, 3)`, which pauses nothing;
  5. "its row goes untold";
  6. "the engine closes it".

**Assertions**:
- After each closer, row 2 reads "Take this road", then `assertClosedNotRelabelled` holds.
- **The standing assertion**, added at d9f69b47: on a fresh `askingRig()`, `revealLog(rows, 5)` leaves row 2 reading "Leave the voyage?". The message is "a paint that leaves the row told leaves the question standing".

**Mutations**, each red on its own clause:
- the `focusout` listener deleted;
- the `keydown` listener deleted;
- `q.close()` in `onPress`'s last branch deleted;
- `q.close()` in the refuse branch deleted;
- `q.closeIfUntold()` in `settle` deleted;
- `closeAsk: ask.close` → `closeAsk: () => {}`;
- `closeIfUntold`'s condition `asking && !asking.row.classList.contains("inked")` → `asking`, which reds the standing assertion.

**Proved**:
- The first six by `vellum-guard-prover` at bdca9fed.
- The seventh by the implementing session only, at d9f69b47 (`handbook/specs/development-workflow.md` step 15). The PR body says so.
- The `forget` mutation is gone from this list (C25, C26).

### T10: new, `test/site/reading-frame-log.test.ts`, after T5

**Name**: "a rebuilt or hidden journal paints only the presses it shows, never the ones it let go (#434)"

**Body**, with the file's own `roadPanel`, `press2`, `ROAD_PORTS`, `HOME` and `ROAD_LEGS`:

```ts
test("a rebuilt or hidden journal paints only the presses it shows, never the ones it let go (#434)", async () => {
  const { panel, rows } = await roadPanel();
  panel.revealLog(rows, 5);
  const replaced = press2(rows);
  assert.equal(replaced.getAttribute("aria-disabled"), "false", "the old row 2 is told, so its press works");

  const { rows: fresh } = panel.buildLogPanel(ROAD_PORTS, 1200, 42, "x", HOME, ROAD_LEGS);
  assert.equal(press2(fresh).getAttribute("aria-disabled"), "true", "the new row 2 starts untold");
  rows[2]!.classList.toggle("inked", false);
  panel.revealLog(fresh, 5);
  assert.equal(press2(fresh).getAttribute("aria-disabled"), "false", "witness: the paint ran, on the new rows");
  assert.equal(
    replaced.getAttribute("aria-disabled"),
    "false",
    "the replaced press is not repainted from its replaced row, so the rebuild let it go",
  );

  const hidden = press2(fresh);
  panel.hideLog();
  fresh[2]!.classList.toggle("inked", false);
  panel.revealLog([], 0);
  assert.equal(
    hidden.getAttribute("aria-disabled"),
    "false",
    "the hidden press is not repainted from its hidden row, so hiding let it go",
  );
});
```

**Why it reads a press the journal no longer shows.** A paint that reaches a detached press is visible only if that press's old row changes and the press follows it. So the test un-tells the replaced row, or the hidden row, and then paints.

**The hide clause's paint** is `revealLog([], 0)`, a paint of an empty journal. No caller paints a hidden journal:
- in `src/site/shared/living-chart/voyage.ts`, `clearVoyage`, the failed branch of the rebuild and `exitVoyage` each set `voyage = null` beside `hideLog`;
- the next paint follows a `buildLogPanel`, which forgets.

So this is the only reach to that line.

**Stub**: none. It guards the build's behaviour and is green at its first run. Its red is each mutation, applied after its commit.

**Mutations**, each applied alone on top of C25's deletion, with the readings from `434-r1-pin-mutants.log`:

| row | change | reading |
|---|---|---|
| control | the branch as built | 10 pass, 0 fail |
| R1 | C25's deletion | 10 pass, 0 fail |
| F2 | `createRoadAsk`'s `forget` body emptied, `seats = []` gone | red: "the replaced press is not repainted from its replaced row, so the rebuild let it go" |
| F3 | `ask.forget();` deleted from `buildLogPanel` | red: the same line |
| F4 | `ask.forget();` deleted from `hideLog` | red: "the hidden press is not repainted from its hidden row, so hiding let it go" |

The two files those rows ran are this T10 and the built `test/site/reading-frame-log.test.ts`.

**Proved by the implementing session only** (step 15), because it is written after the prover's round. The red lines are pasted in the PR body's Guards table.

### What the `forget` mutants showed on the built tests

These readings are what C25 to C27 rest on, from `434-r1-forget-mutants.log`. Each was run alone against T1 to T5 as built.

| row | change | reading |
|---|---|---|
| F1 | `createQuestion.forget`'s `asking = null` deleted | 9 pass |
| F2 | `seats = []` deleted | 9 pass |
| F3 | `buildLogPanel`'s `ask.forget()` deleted | 9 pass |
| F4 | `hideLog`'s `ask.forget()` deleted | 9 pass |
| F6 | `asks` comparing by `href` | 9 pass |
| F1 + F6 | both | 8 pass, 1 fail: T5 at "a rebuilt row asks before it goes" |

No test saw any part of the `forget` path. The rebuild clause bit only under two changes at once.

### The holes the prover found, and where each is held

- **`closeIfUntold` weakened to `if (asking) close();`.** Held by T5's standing assertion, proved by the implementing session only.
- **The `onAgesTold` wrapper's `logPanel.closeAsk();` deleted, at `src/site/shared/living-chart/index.ts` line 72.**
  - It is green in every unit test. It is held by RV8c alone, as `434-plan.md`'s RV8c mutation list planned.
  - The implementer proved it on a rebuild.
- **`forget`.** C25 to C27.

### What the prover owes

Nothing more.
- Its one round ran: 38 mutations at bdca9fed.
- The two guards written after it, the standing assertion and T10, are proved by the implementing session.

### RV8b and RV8c

- **Unchanged.** `434-plan.md`'s sections stand, with B7 above.
- **Not re-run for this revision's sake.** The edit removes a line F1 showed no test reaching, and no browser check reads the question across a rebuild.
- The one `room-voyage-route` run under Evidence is the suite's run against the changed engine file.

## Order of commits

The branch is `feat/434-journal-road`, resumed at d9f69b47. Its nine commits stand.

10. `#434 Revision 1: the question drops a forget no check could see, and a rebuilt or hidden journal lets go of the presses it no longer shows (T5, T10)`. This commit carries:
    - `handbook/plans/400/434/434-r1-plan.md`;
    - C25's edit to `src/site/shared/living-chart/voyage-log-panel.ts`;
    - the T5 deletion and rename, and T10, in `test/site/reading-frame-log.test.ts`.

    Push.

Then prove T10 with the commit in place:
1. Apply F2 alone, run `npm test -- test/site/reading-frame-log.test.ts`, and read the red line.
2. Restore with `git checkout -- src/site/shared/living-chart/voyage-log-panel.ts`. That is safe, because the work is committed.
3. Do the same for F3, then F4.

No other commit is planned. The combined-state run under Evidence merges `origin/main` and aborts the merge, so it adds no commit.

## Rosters and doctrine (replaces `434-plan.md`'s section)

- **Rosters joined: one.**
  - The roster is `TIPPING_LINKS` in `scripts/lint/sheet-motion.ts`, which gains `"shared/reading-frame.css :: .rf-log-strip li.prologue .cr-road:is(:hover, :focus-visible)"` (C24).
  - **What the rule does.** `vellum/css-tip-goes-somewhere` reports every `:hover` rule whose declarations carry `rotate(` and that stands on none of `TIPPING_LINKS`, `CHART_INSTRUMENTS` and `TIPS_AWAITING_A_RULING`.
    - The gold press's hover carries `rotate(-0.6deg)`.
    - The pale hover hold sets `transform: none` and joins no list.
  - **What `434-plan.md`'s sweep missed.** It never read those three lists. That is why "Rosters joined: none" was false.
  - **The rest of that sweep stands**, verified by recon at d9f69b47:
    - `full-log`'s only import;
    - `API` in `test-support/living-chart-hosts.ts`;
    - `SOURCE_READS`, since T10 reads no source file;
    - `MEASURED_SECONDS`;
    - `recordingLogPanel`, which spreads `barlessLogPanel()` and so gains `closeAsk`.
  - `test/repo/sheet-motion.test.ts`'s check that every list entry names a sheet under `src/styles/` holds for the new line. `shared/reading-frame.css` is one, and `npm run lint` at d9f69b47 is green.
- **Doctrine edited**: as `434-plan.md` says, built at bdca9fed.
  - No further edit is owed.
  - "Gesture" in `handbook/specs/ui-design.md` asks a new tip to join a list consciously, and C24 is that join.
  - No spec names `createQuestion` or the `forget` path: `git grep -n "forget" -- handbook/specs` finds nothing about the journal.
- **Doctrine checked and left**: as `434-plan.md` says.

## Evidence

What remains, in this order, after commit 10:
- **Unit**:
  - `npm test -- test/site/reading-frame-log.test.ts`;
  - then `npm test`;
  - then `npm run astro:generate`.
- **The rest**: `npm run check`, `npm run lint`, `npm run format:check`.
- **Browser**: `npm run build`, then `VELLUM_E2E_SUITES=room-voyage-route npm run test:e2e`, once, alone.
- **T10's proof**: the three red lines from the loop under Order of commits, pasted in the Guards table.
- **The combined state**:
  - `git merge --no-commit --no-ff origin/main`, so that a clean merge stops before it commits;
  - `npm test`;
  - then `git merge --abort`, so the branch stays clean for review.

  Main moved by PR #1242, which shares no file with this branch, and the body says what that run printed (workflow step 10).
- **`vellum-plate-reader`**: not owed again. This revision changes no appearance, and its round ran at bdca9fed.
- **A new dated step 12 comment on the issue, before the PR opens.** It records C24 to C28 from the Calls below, and says:
  - revision 1 (`handbook/plans/400/434/434-r1-plan.md`) takes the implementer's B1 as its call C24;
  - it replaces B4 with C25 to C27;
  - comment 6646499921 stands unedited.
- **The PR body owes**, beside what `434-plan.md` and the hand-back list:
  - the revision named, with the four changes this file opens with;
  - C24 named as the planner's call in revision 1, never as ruled;
  - the standing assertion and T10, each proved by the implementing session only;
  - C25's deletion, with F1's reading;
  - C17's deviation from the still;
  - T9's measured cost;
  - under "Look for these when you use it", C28's note on a focused pale press, naming `434-r1-focus-pale.png` beside the gold and resting controls.

## Calls made

C1 to C23 stand as `434-plan.md` writes them. These are new.

### C24. The gold press's hover joins `TIPPING_LINKS`

This takes the implementer's B1 as the planner's call.

**The press is a link that goes somewhere.**
- `TIPPING_LINKS` is "The surfaces that tip AND navigate (each is a link or wraps one)" (`scripts/lint/sheet-motion.ts`).
- The press is an `<a href="/ribbon/#...">` (C3), and ruling A has its second press go to the Ribbon in this tab. A middle-click goes at once.
- "Leave the voyage?" is a check on the way out, not an instrument that opens something in place.

**The one press that goes nowhere carries no tip.**
- "A tip on something that goes somewhere is the house's gesture; a tip on something that does not is a false affordance" (`handbook/specs/ui-design.md`, "Gesture").
- The pale press goes nowhere, and it carries no tip: its hover hold sets `transform: none`. The design already treats only the told press as a link.

**Alex ruled this face, tip included.**
- M1 ruled "Small gold button, own line (Recommended)", the place card's "Take the road" face.
- `.pc-ribbon`'s hover, with the same `translateY(var(--raise)) rotate(-0.6deg)`, is a `TIPPING_LINKS` entry.
- The hover still he ruled from carried the tilt:
  - `out/434/434-gold-hide-hover-closeup-1024.png` shows it;
  - in `out/434/measurements.json`, the spike's own hover record `gold-hide-1024.hover.press` measures 95.34 by 25.09 px, the tilted box, with the border `rgb(107, 90, 64)`. Its own resting record `gold-hide-1024.mid.press` measures 95.09 by 24.09 with the border `rgb(185, 167, 127)`.

**Neither other list fits.**
- `CHART_INSTRUMENTS` is the ratified class for a tip whose own press does not leave the page. Its one entry is the station pip, whose slip's Enter link is what leaves.
- `TIPS_AWAITING_A_RULING` parks a tip that goes nowhere.

**No comment at the entry.** The list's own doc line says what an entry is, and the record is this call and the step 12 comment.

**If Alex overrules it**, the alternative is an appearance change from the still he ruled: the told press's hover keeps its lift and its darker border and drops the tilt, and then joins no list.

### C25. `createQuestion`'s `forget` is deleted, and its call with it

**The line does nothing that matters.**
- `asks` compares by identity, and every press builds a new seat. So a rebuilt journal's first press asks whether or not the old seat is dropped: F1 left all 9 tests green.
- The next `close()` drops the reference anyway. The next press runs it, and so does the engine's `closeAsk` on each paint of the position.
- The guard prover named the line an equivalent mutant.

**The rule**:
- A line that bears no load, and that no check can see, is deleted rather than shipped as an unproven line beside a pull request's guards. That is the workspace `CLAUDE.md`'s "check your work ... Is it over-engineered?".
- The `forget` lines that do bear load are pinned instead (C27).

### C26. T5's rebuild clause is deleted

**The rule**: `CLAUDE.md`, "Process": "Zero red from the prover is a hole, not a pass. A guard proved unable to bite is deleted rather than shipped."

**The measurement.** No single change to the shipped code reds it: F1 to F4 and F6 each leave it green. Only F1 and F6 together, two changes, red it.

**What it said still holds by construction**, and is held where it can fail:
- a fresh build's press reads "Take this road" (T1);
- its first press asks (T4).
- M4's "drawing a new chart" resets the question because a new chart builds new presses.

### C27. T10 pins what `forget` lets go

**The rules**:
- the workspace `CLAUDE.md`'s "A load-bearing invariant earns a test first";
- `CLAUDE.md`'s "A guard proves it can fail".

**What it pins.** `seats = []` bounds `settle`'s repaint list to the journal on show. Without it, every road press of every journal drawn in the sitting is repainted on every reveal and kept in memory. `hideLog`'s call is what lets the last journal's presses go when the reader leaves the voyage and nothing is drawn after.

**The measurement**: F2 and F3 red the rebuild clause, F4 reds the hide clause, and the control and C25 are green (`434-r1-pin-mutants.log`).

**Flagged for Alex to overrule.** This goes beyond the two points the hand-back stopped on. Without it, all three lines would ship unguarded, and the PR body would have to say so.

### C28. A keyboard reader's view of a pale press is a note for Alex, not a plan matter

The plan's accessibility claims hold. The readings come from `out/434-dry-run/434-r1-focus.log` on the build from d9f69b47, after a real Tab (`sendKey`) onto the first inbound road leg's press, each read once its rect had stood still.

**The pale press, focused**:
- `document.activeElement` is the press, and `:focus-visible` matches.
- It wears the house ring from `src/styles/shared/house.css`: `outline` solid 2 px `rgb(74, 56, 38)` at a 2 px offset.
- The ring reads 9.46:1 on the slip's `rgb(244, 236, 216)`, against non-text contrast's 3:1. It sits inside every clipping ancestor (`slip-body`, `room chart-room`, `HTML`).
- `transform: none`, its border stays `rgb(205, 189, 151)` and its ground stays cream `rgb(248, 241, 224)`.

**The controls, in the same run**:
- The gold press, focused, wears the same ring plus the lift and tilt (`matrix(0.999945, -0.0104718, 0.0104718, 0.999945, 0, -2)`) and the border `rgb(107, 90, 64)`.
- The pale press at rest wears no ring.

**What the screen reader gets.** The plate reader's accessibility read at bdca9fed stands: "Take this road Not reached yet", marked unavailable, while pale; "Take this road" once told.

**Why it is a note and not a change.**
- The missing lift and border change is the designed refusal. A press that goes nowhere must not make the gesture of one that does (C24), and the place card's `.pc-lay.dim` holds its dim the same way on focus.
- The feel of the pale wait is already provisional until the post-use review, in the voice line `434-plan.md` added.

**The stills**: `out/434-r1-focus/434-r1-focus-pale.png`, `434-r1-focus-gold.png` and `434-r1-focus-pale-rest.png`, with their page `out/434-r1-focus/index.html`.

## Open decisions

none.

## Stop conditions

Hand back, rather than adapt, on any of these:

- **The branch is not where this revision read it.** `git ls-remote origin refs/heads/feat/434-journal-road` prints a head other than d9f69b47a2588d1e78934b435ddbd1de40d91898.
- **A file this revision edits moved on main.** `git diff --stat ec4f4289 origin/main -- src/site/shared/living-chart/voyage-log-panel.ts test/site/reading-frame-log.test.ts scripts/lint/sheet-motion.ts handbook/plans/400/434/` prints a line.
- **The deletion is not where this revision says.**
  - The text C25 deletes is not in `voyage-log-panel.ts` as quoted.
  - Or anything other than `createRoadAsk`'s `forget` calls `createQuestion`'s `forget`: `git grep -n "q.forget" -- src` finds a second call.
- **The deletion changes a reading.** Any of T1 to T5 reds after C25's deletion. R1 read them green.
- **T10 does not read as measured.** On the implementer's run, it is:
  - red at commit 10, unmutated;
  - or green under any of F2, F3 and F4;
  - or red under one of them on a line other than the one its row names.
- **A check outside the unit file reds.** `npm run lint` reds on `TIPPING_LINKS` (an entry called stale, or the tip reported again), or `room-voyage-route` reds after the build.
- **The issue moved.** It holds more than 10 comments, other than this revision's plan archive (a first line beginning `Plan archive, not a ruling:`).
- **The combined state reds.** The `npm test` run on the merge with `origin/main` reds where the branch alone is green.
