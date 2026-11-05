# Plan: Issue #434, revision 2

**Revision 2 of `434-plan.md`, revising `434-r1-plan.md`**, written for Alex's ruling on the cold skeptic's finding 1 for PR #1243, on `feat/434-journal-road` at 34c856ddc00b862a0170a6f8e4dcc4c8b5765aeb. The ruling, quoted from comment 6647404370: "Pale button has no link until reached". It changes five things against `434-r1-plan.md`:

1. **The pale press carries no address.** The press gets its `href` when its row is told and loses it when the row goes untold. `paintSeat` writes it, beside `aria-disabled` and the note (C29).
2. **Three checks read the address**:
   - T1 reads it after a reveal;
   - T3 gains five address assertions;
   - RV8b reads its legs at the told state and asserts that no pale press carries an address (C32, C35).
3. **One house rule gains a written exception.** `handbook/specs/ui-design.md` says a refusing press stays reachable by keyboard, and this press no longer is (Alex's M1 ruling).
4. **The errata row for finding 1 is deleted**, because this pull request now fixes it (C36).
5. **C28 is withdrawn.** Its keyboard note and stills describe a pale press Tab can no longer reach (C37, ruled with M1).

**Everything else in `434-plan.md` and `434-r1-plan.md` stands as written, and is built at 34c856dd.** This revision does not re-plan it.
- Where a section below says it replaces a section of an earlier plan, it replaces that section whole.
- Where it says it corrects one, it changes only the lines it names.

**Planned at**: `origin/main` ec4f4289ee89cb0d56b55b324806740dcccb6e1b, and the issue read at 14 comments (`gh api repos/ahl-gram/Vellum/issues/434/comments --paginate | jq length`). Both were re-recorded after the rulings were folded in; the 14th comment is the rulings comment, 6647997725. The branch head was read at 34c856dd (`git ls-remote origin refs/heads/feat/434-journal-road`).
- Main has not moved since `434-r1-plan.md`. ec4f4289 (PR #1242) is merged into the branch at 4f528c82.
- **The #421 lane shares no file with this branch.**
  - `git fetch origin feat/421-region-carries-beast`, then `git diff --stat origin/main...FETCH_HEAD`, lists 12 files at c1e3650b, none of which this branch or this revision touches.
  - The dispatcher's list for that lane named `src/render/map-renderer.ts`, which it does not touch. It also touches `src/site/shared/table-address.ts`, but only the comment above the table dress; `TABLE_KEY` is unchanged.

**Rulings**:
- the four comments `434-plan.md` lists: 6643897113, 6643975537, 6645742777 and 6645788043;
- https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6647404370, "Pale button has no link until reached";
- and this revision's menu, https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6647997725:
  - M1: "Tab skips a pale button (Recommended)". A pale press is no Tab stop, and the house rule that a refusing button stays pressable gets one written exception for it.
  - C33: "Browser's own pointer (Recommended)". No cursor rule is added.
  - The comment also records the correction this revision measured. In Chrome, the pale press with no `href` still reads as a link named "Take this road Not reached yet", marked unavailable and not focusable. Alex was told this when he answered M1.

**Open decisions**: none.

**How the readings were taken.** Every reading below is new to this revision.
- **The planner's tree** is `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-adc9883116b70d668/`. It was switched detached to 34c856dd for every run.
- **The browser readings**:
  - probe `out/434-dry-run/434-r2-probe.ts`, run as `node out/434-dry-run/434-r2-probe.ts <arm> > out/434-dry-run/434-r2-<arm>.log 2> out/434-dry-run/434-r2-<arm>.err`, one arm at a time;
  - on the site `npm run build` made from 34c856dd (`out/434-dry-run/434-r2-build.log`, `434-r2-build.sha`), in Brave 156, the browser `findBrowser` picks.
- **How the change is staged.** The probe edits no source. It stashes each press's address once, at `__vellumVoyageStepTo(999)`, where every press is told. It then wraps `window.__vellumVoyageStepTo`, so that after the original call it sets the stashed `href` on every press whose row is inked and removes it from every other.
  - That is the planned `paintSeat`, run in the same synchronous task as the step.
  - The arm `rv8b-staged-noset` runs the same wrap with the set half left out. That is mutation R-b.
- **On a build of the change**, the probe's keys named `built...` and its whole `rv8b-built` arm read the change itself. The staged arms are then a no-op on top of it. That is how the implementer retakes the readings (Evidence).
- **The unit readings**:
  - harness `out/434-dry-run/434-r2-unit-mutants.ts`, log `434-r2-unit-mutants.log` beside it;
  - run as `node <harness> <tree>` at 34c856dd;
  - it writes the planned source and test edits into the tree, runs `npm test -- test/site/reading-frame-log.test.ts` under each arm, and restores both files after each; it printed `restored`, and `git status --porcelain` was empty after.
- **The RV8b edit's lint, format and type check**:
  - `out/434-dry-run/434-r2-e2e-check.ts`, log `434-r2-e2e-check.log`;
  - it wrote the planned `road-press.ts` to `out/434-dry-run/434-r2-planned-road-press.ts` and restored the tree's file.
- **The planned files, as prettier lays them out**: `out/434-dry-run/434-r2-planned-voyage-log-panel.pretty.ts` and `434-r2-planned-reading-frame-log.pretty.ts`, written by `434-r2-render.ts`.
- **Copies of every scratchpad file named above** sit in `out/434-dry-run/` beside the probe, and travel with that folder.
- **The #421 lane ran a node probe (no browser) while this tree built.** No other browser and no suite was running before either batch of browser runs (`ps -axo command | grep remote-debugging-port` printed nothing).

## Specs

These come on top of the lists in `434-plan.md` and `434-r1-plan.md`, which stand:

- `handbook/specs/ui-design.md`:
  - "Colour, contrast and legibility", the refusing-press paragraph, which this revision edits;
  - "Gesture", a tip promises the surface goes somewhere;
  - "The voice", whose journal line stays true (C30).
- `handbook/errata/README.md`, "How a row leaves", "Fixed" (C36).
- `handbook/specs/settle-doctrine.md`:
  - clause 11, a check sets the state it reads (C32);
  - "What a step holds" and "Who finds a slow step" (What each step holds).
- `handbook/specs/development-workflow.md`:
  - step 8, the revision archived beside the plans it revises;
  - step 12, a new comment and never an edit;
  - step 15, guards changed after the prover's round, and a presentation change after the plate reader's, are proven and measured by the implementing session.
- `.claude/skills/vellum-footguns/SKILL.md`:
  - Gate 1 before the test edits;
  - Gate 2 before the RV8b edit, item 16 included;
  - Gate 5 at the push and the body.

## The design

**The press carries its address only while its row is told.**
- `Seat` holds the address the host wrote, and `roadPressParts` builds the press with no `href`.
- `paintSeat` is the one writer of the press's state. On a told row it sets `href` to that address. On an untold row it removes it, beside the `aria-disabled` and the note it already writes.
- It runs where it runs today: once at build, from `createRoadAsk`'s `press`, and on every `revealLog`, through `settle`.

**A rebuild and a re-arm need no code of their own.**
- A rebuilt journal builds fresh presses, each painted untold at build, so each has no address. `hideLog` empties the strip.
- `revealLog` is the only writer of `inked` on a prologue row. Recon found it so: `grep` of `classList.(add|toggle|remove)("inked"` over `src/` finds the other writers on annal, dated-log and index rows only. So no row changes its told state without the paint.

**What the reader gets**, measured on the staged press (readings under Tests):
- **A click of any kind on a pale press opens nothing.**
  - A middle-click opens no tab.
  - With no `href`, the browser offers no link items in its context menu. That part is UNVERIFIABLE by a probe, since a probe cannot open the menu.
  - An ordinary click is refused by the press's own listener, as today.
- **Tab passes over a pale press** and reaches it once its row is told. A told press keeps its ring, its tip and its two presses unchanged.
- **A screen reader in Chromium still hears it as a link.**
  - It is named "Take this road Not reached yet" and marked unavailable, and it is not focusable.
  - It stays a link only because it carries a click listener. A copy without listeners reads as a plain generic element.
  - What Firefox and Safari give is UNVERIFIABLE here. HTML maps an `a` without `href` to a generic element, whose words are still read in the row's order.
- **The pointer is no longer the hand.** The press's computed `cursor` is `auto`, where it was `pointer` (C33). Which glyph `auto` paints over the press's words is UNVERIFIABLE by a probe, which reads the computed value only.
- **Hover still holds the pale dress**: no tip, a faint border, a cream ground.
- **If a reader holds keyboard focus on a told press and its row goes untold**, focus drops to the page. The question closes as it does today, through `closeIfUntold`, with `focusout` firing too.

### Alternatives rejected in this revision

- **A `role="link"` and `tabindex="0"` on the pale press, kept until told** (the errata row's option 1 in full). This was M1's option 2. Alex ruled against it: "Tab skips a pale button (Recommended)", comment 6647997725.
- **An `href="#"` or an empty `href` while pale.** That is still a link: a middle-click opens the room again in a new tab, and the context menu offers it. The ruling is no link.
- **The address in a `data-` attribute on the press**, as the errata row's fix sketched.
  - The seat already holds the press's state and builds its listeners in a closure.
  - A second copy in the DOM would have no reader.
- **Dropping `aria-disabled`.** Measured, it is what marks the pale press unavailable to a screen reader in Chromium. Without it, the pale press reads as an available link that Tab cannot reach (C30).
- **Deleting the refuse branch's `preventDefault`** (C31).
- **`cursor: default` on the pale press.** Alex ruled the browser's own pointer instead (C33, comment 6647997725).
- **Leaving RV8b's leg read before its `stepTo(0)`** (C32).

## Files

Line counts are at 34c856dd, written as `wc -l` / the lint's `max-lines` count (skipping blank and comment lines).

### `src/site/shared/living-chart/voyage-log-panel.ts` (238 / 205; 240 / 207 after, measured by `434-r2-unit-mutants.ts`)

Four edits, and nothing else in the file changes. As prettier lays them out (`434-r2-planned-voyage-log-panel.pretty.ts`, unchanged by `npx prettier`):

1. `roadPressParts` takes no argument and sets no `href`:

   ```ts
   function roadPressParts() {
     const press = document.createElement("a");
     press.className = "cr-road";
     const label = document.createElement("span");
   ```

   The rest of its body is unchanged.
2. `type Seat` gains a last field: `readonly href: string;`, after `readonly row: HTMLLIElement;`.
3. `paintSeat` becomes:

   ```ts
   function paintSeat(s: Seat): void {
     const { press, note, row, href } = s;
     const told = row.classList.contains("inked");
     if (told) press.setAttribute("href", href);
     else press.removeAttribute("href");
     press.setAttribute("aria-disabled", String(!told));
     note.hidden = told;
   }
   ```

4. In `createRoadAsk`'s `press`, `const s: Seat = { ...roadPressParts(href), row };` becomes `const s: Seat = { ...roadPressParts(), row, href };`.

**No `hasAttribute` or `toggleAttribute`.** `test-support/element-shim.ts` offers `getAttribute`, `setAttribute` and `removeAttribute` only.

**Checks run on the edit**: `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` exit 0, and `npx tsc --noEmit` exit 0 (`434-r2-unit-mutants.log`). `paintSeat` is 8 lines, and every function stays under 50.

### `test/site/reading-frame-log.test.ts`

**As built at 34c856dd, with two tests edited.** As prettier lays them out (`434-r2-planned-reading-frame-log.pretty.ts`):

**T1** (its name unchanged): its first line, `const { log, rows } = await roadPanel();`, becomes these two lines:

```ts
  const { panel, log, rows } = await roadPanel();
  panel.revealLog(rows, 5);
```

**T3's name** becomes "the press stands pale and carries no address until the voyage reaches its row: it refuses, pauses nothing, and says Not reached yet; told, it takes its address and works, and the note goes (#434 M2)".

**T3 gains five lines**, each inserted where it says:

1. After the build's `assert.equal(noteOf(p2).hidden, false);` (the first one):

   ```ts
     assert.equal(
       p2.getAttribute("href"),
       null,
       "a pale press carries no address, so no click of any kind opens the Ribbon",
     );
   ```

2. After the `assert.equal(noteOf(p2).hidden, false);` that follows `"row 2 is still untold"`:

   ```ts
     assert.equal(p2.getAttribute("href"), null, "nor while its row is still untold");
   ```

3. After `assert.equal(noteOf(p2).hidden, true, "and the note goes");`:

   ```ts
     assert.equal(p2.getAttribute("href"), "/ribbon/#seed=42&a=4&b=9", "and it takes its leg's address");
   ```

4. After the `assert.equal(noteOf(p3).hidden, false);`:

   ```ts
     assert.equal(p3.getAttribute("href"), null, "and carries none");
   ```

5. After the last `assert.equal(noteOf(p2).hidden, false);`, the one that follows `"scrubbed back, it is pale again"`:

   ```ts
     assert.equal(p2.getAttribute("href"), null, "and gives its address up");
   ```

**Nothing else in the file changes.** T2, T4, T5 and T10 stand as built, and the file still holds 10 tests.

### `e2e/suites/room-voyage-route/road-press.ts` (171; 172 after)

**RV8b only. RV8c and everything else in the file are unchanged.** The planned file is `out/434-dry-run/434-r2-planned-road-press.ts`, which `npx prettier --write` left unchanged and `npx eslint ... --max-warnings 0` and `npx tsc --noEmit` passed (`434-r2-e2e-check.log`). The edits:

1. In `type Leg`'s `press`, `path: string;` becomes `path: string | null;`.
2. `type Pale` gains a first field: `type Pale = { href: string | null; bg: string; press: string; li: string; prose: string | null; gutter: string | null };`.
3. `paleOk` gains a first conjunct: `p.href === null && p.bg === CREAM && ...`, the rest as built.
4. `RV8B_READ` is replaced whole. The dated comment line above it stays as built. The new read:

   ```js
   const RV8B_READ = `(()=>{
     const plan=window.__vellumVoyagePlan();const rows=()=>[...document.querySelectorAll(".rf-log-strip li.prologue")];
     const done=()=>document.querySelectorAll(".rf-log-strip li").forEach((li)=>li.getAnimations({subtree:true}).forEach((a)=>a.finish()));
     const cs=(el,k)=>el?getComputedStyle(el)[k]:null;
     window.__vellumVoyageStepTo(0);done();
     const pale=rows().filter((r)=>!r.classList.contains("inked")&&r.querySelector(".cr-road")).map((r)=>{const p=r.querySelector(".cr-road");
       return{href:p.getAttribute("href"),bg:cs(p,"backgroundColor"),press:cs(p,"opacity"),li:cs(r,"opacity"),prose:cs(r.querySelector(".cr-prose"),"opacity"),gutter:cs(r.querySelector(".cr-year"),"opacity")};});
     window.__vellumVoyageStepTo(999);done();
     const rs=rows();
     const legs=plan.legs.map((l,i)=>{const p=rs[i+1]?rs[i+1].querySelector(".cr-road"):null;let press=null;
       if(p){const h=p.getAttribute("href");const u=h===null?null:new URL(h,location.href);const q=new URLSearchParams(u?u.hash.slice(1):"");const lab=p.querySelector(".cr-road-label");
         press={label:lab?lab.textContent:null,path:u?u.pathname:null,a:q.get("a"),b:q.get("b"),seed:q.get("seed"),target:p.target,
           dropped:["theme","legend","arms","beasts","survey","year"].filter((k)=>q.has(k))};}
       return{i,mode:l.mode,from:l.fromIdx,to:l.toIdx,last:i===plan.legs.length-1,press};});
     const told=[...document.querySelectorAll(".rf-log-strip li.prologue.inked .cr-road")].map((p)=>cs(p,"backgroundColor"));
     const status=document.querySelector(".rf-status").textContent,summary=window.__vellumVoyageLog().summary;
     return{rows:rs.length,legs,pale,told,restored:status===summary&&summary!==""};})()`;
   ```

5. The check's label becomes "RV8b the journal's road rows carry Take this road to the Ribbon at that leg's two towns, its sea rows and its last entry carry none, and a press stands pale, unfaded and with no address on a row the voyage has not reached, gold once it has (#434)".
   - `git grep -n "pale and unfaded" -- ':!handbook/plans'` finds only this label.
   - The step id `RV8b` in `e2e/suites/room-voyage-route.ts` is unchanged.

`rowOk` is unchanged: its `path === "/ribbon/"` is what reds a told press with no address.

### `handbook/errata/site.md`

Delete the one line that begins `- PR #1243 (2026-11-05, medium): a pale journal press`. After that, `git diff origin/main -- handbook/errata/site.md` prints nothing (C36).

### `handbook/specs/ui-design.md`, "Colour, contrast and legibility"

**This is Alex's M1 ruling** (comment 6647997725). The rule lives in this paragraph, at lines 439 to 442 at 34c856dd, and nowhere else under `handbook/specs/`: recon's `grep -rniE "aria-disabled|refusing press|stays pressable|keyboard reader|still reaches" handbook/specs` found no other line about a refusing press's keyboard reach.

Replace these four lines:

```
**A refusing press dims by swapping its ground, never by opacity.** Opacity takes the face under the
floor, where a cream ground under full-strength ink keeps it far above it (`.pc-lay.dim` in
`src/styles/shared/living-chart.css` carries the measurement). The press stays pressable rather than
`disabled`, so a keyboard reader still reaches it and hears why it refuses.
```

with these eight:

```
**A refusing press dims by swapping its ground, never by opacity.** Opacity takes the face under the
floor, where a cream ground under full-strength ink keeps it far above it (`.pc-lay.dim` in
`src/styles/shared/living-chart.css` carries the measurement). The press stays pressable rather than
`disabled`, so a keyboard reader still reaches it and hears why it refuses. **The one ruled
exception is the journal's pale "Take this road"**, which carries no address until the voyage
reaches its row, so no click of any kind leaves the room early and Tab passes over it until then
(Alex, 2026-11-05, Issue #434 comments 6647404370 and 6647997725; `paintSeat` in
`src/site/shared/living-chart/voyage-log-panel.ts`).
```

- The fences only mark the text off here: the spec's lines are written exactly as between them, with no fence.
- The new text holds no em-dash.
- Its one backticked path, `src/site/shared/living-chart/voyage-log-panel.ts`, resolves, which `test/repo/prose-paths.test.ts` requires.

### `handbook/plans/400/434/434-r2-plan.md` (new)

This file, copied unchanged from the scratchpad after the rulings are folded in. It goes beside `434-plan.md` and `434-r1-plan.md`, which stay as they are.

### Files not edited, checked

- **`src/styles/shared/reading-frame.css`**: no edit (C34).
  - The style arm measured exactly one computed difference on the press and its label when the address goes: `cursor`.
  - No sheet the house ships keys a rule on `href`: `git grep -n -e ":any-link" -e "a\[href" -e ":link" -e ":visited" -- src/styles` prints nothing.
- **`scripts/lint/sheet-motion.ts`**: no edit. C24's `TIPPING_LINKS` entry stands: only the told press, which is a link, tips.
- **`handbook/specs/ui-design.md` "The voice"** and **`handbook/specs/explorer-doctrine.md`**: no edit (C30).

## Tests

**The order they are written.** The test edits come first.
1. Apply the T1 and T3 edits to the branch's source as it stands. Run `npm test -- test/site/reading-frame-log.test.ts`. It reds as measured below, row "red first".
2. Then the source edit, and the file runs green.
3. Then the RV8b edit.

**What the prover owes: nothing.** Its one round ran at bdca9fed. Every guard this revision changes or adds is proved by the implementing session only (`handbook/specs/development-workflow.md` step 15), and the PR body says so:
- T1's edit;
- T3's five clauses;
- RV8b's new read and clause.

### T1: corrected

**Assertion**: as built, now on a journal revealed to the end, so every press it reads is told and carries its address.

**Mutations**, re-proved by the implementing session because T1 changed. Each should red where the prover's round read it:
- `leg.mode === "road"` → `leg.mode !== "straight"`;
- `rowLeg`'s `|| (homecoming && i === count - 1)` deleted;
- `legs[i - 1]` → `legs[i]`.

### T3: corrected

**Assertions added**:
- at build, and after `revealLog(rows, 2)`, row 2's press has no `href`;
- after `revealLog(rows, 3)`, row 2's press carries `/ribbon/#seed=42&a=4&b=9`, and row 3's has none;
- after `revealLog(rows, 2)` again, row 2's press has none.

**Red first**: the planned tests on the branch's source, which sets `href` at build.

**Mutations**, each on the planned source alone:
- M1: delete `else press.removeAttribute("href");`;
- M2: the two lines become `if (!told) press.removeAttribute("href");`, so the set half is gone;
- M3: `if (told)` → `if (!told)`.

T3's existing mutations stand. The one still re-run here is M4, the `paintSeat(s)` call in `press` deleted.

**Readings** (`434-r2-unit-mutants.log`):

| row | source and tests | reading |
|---|---|---|
| control | the branch as built, its own tests | 10 pass, 0 fail |
| red first | the branch as built, the planned tests | 9 pass, 1 fail: T3 at "a pale press carries no address, so no click of any kind opens the Ribbon" |
| P alone | the planned source, the branch's own tests | 9 pass, 1 fail: T1 at its `href` read (`Expected values to be strictly equal`), which is why T1 changes |
| P + T | the planned source and tests | 10 pass, 0 fail |
| M1 | remove half deleted | 9 pass, 1 fail: T3 at "and gives its address up" |
| M2 | set half deleted | 8 pass, 2 fail: T1 at its `href` read, T3 at "and it takes its leg's address" |
| M3 | condition inverted | 8 pass, 2 fail: T1 at its `href` read, T3 at "a pale press carries no address, so no click of any kind opens the Ribbon" |
| M4 | `paintSeat(s)` in `press` deleted | 8 pass, 2 fail: T3 at "at build no row is told", T10 at "the new row 2 starts untold" |

### T2, T4, T5 and T10: unchanged

- **T4's second press** is on a told row, so its press carries its address as it does today.
- **T5's closer "a pale press is pressed"** still holds in a browser, and C23 stands.
  - On the staged press (arm `c23`), row 1 was told and row 2 pale at `stepTo(1)`.
  - A real click on row 1's press asked "Leave the voyage?" with focus on it.
  - A real click on row 2's pale press (no `href`, `elementFromPoint` on it) reached that press's own listener: the recorder read `{"which":"pale","prevented":true}`.
  - Row 1 then read "Take this road", focus was on the body, and the page was still `/reading-room/`.
  - An element that is neither a link nor focusable still takes a click. In a browser the click's focus change closes the question too.
- **T10 reads `aria-disabled`**, which `paintSeat` still writes beside the address. Its three mutations were re-run on the planned source and tests, and each still reds T10 on its own line (`434-r2-unit-mutants.log`):
  - F2, `createRoadAsk`'s `seats = []` deleted: "the replaced press is not repainted from its replaced row, so the rebuild let it go";
  - F3, `buildLogPanel`'s `ask.forget()` deleted: the same line;
  - F4, `hideLog`'s `ask.forget()` deleted: "the hidden press is not repainted from its hidden row, so hiding let it go".

### RV8b: corrected

**The read.**
- It sets every state it reads: `stepTo(0)` for the pale half, then `stepTo(999)` for the legs, the gold and the status line (C32).
- It reads each press's address through `getAttribute`, so a press with no address reads `null` and does not throw in `new URL("")`.

**Assertion**: as built, plus every press on an untold row reads `href` null. A told press with no address fails `rowOk` on its path.

**Readings**, from the probe on the build of 34c856dd:

- **Fixture**, the change staged (`434-r2-rv8b-staged.log`): `ok: true`.
  - 25 rows and 24 legs (13 road, 11 sea), the closing leg road, and 0 rows fail.
  - Pale: 12 of 12 pass, each `{ href: null, bg: "rgb(248, 241, 224)", press: "1", li: "1", prose: "0.4", gutter: "0.4" }`.
  - Told: 12 of 12 gold, and `restored: true`.
  - Every instance passes alike, so the nearest to failing is any of them, for example leg 0 (0 to 1).
- **Mutation R-a**, the remove half deleted. The branch as built reads the same at this check, because RV7 leaves every press told and so addressed (`434-r2-rv8b-built.log`): `ok: false`.
  - 0 rows fail; pale: 0 of 12 pass.
  - Each fails on `href` alone, every other field passing. The nearest to passing is any of them alike, for example leg 0's `"/ribbon/#seed=526413615&style=antique&a=0&b=1"`.
- **Mutation R-b**, the set half deleted (`434-r2-rv8b-staged-noset.log`): `ok: false`.
  - 12 rows fail, every inbound road row, each with `path: null`, from leg 0 (0 to 1) to leg 22.
  - Pale: 12 of 12 pass. Every failing row fails on its address alone.

**`434-plan.md`'s five RV8b mutations stand**: road mode always true, `legs[i]`, the homecoming clause, the pale ground rule and the lift rule.
- This revision does not re-quote their readings.
- The pale half reads what it read with one field added, and the leg read now runs at `stepTo(999)`, the state RV7 already left it in.
- They are re-proved with R-a and R-b, because RV8b changed.

### RV8c: unchanged

RV8c touches only a told press. Its own sequence was run on the build, watching the first inbound road row (`434-r2-rv8c-row.log`), through:
- `stepTo(999)`;
- `setYear(0)`;
- Play;
- the first press, which asked;
- `setYear(min + 50)`, which closed the question with focus on the press;
- the two further presses.

The row's class never changed: no mutation was recorded, and it read `inked` throughout. Under the change its press keeps its address and its focus.

### The rest of the browser readings, for the PR body and the stop conditions

Each is the first inbound road leg's press (leg 0, row 1).

- **Accessibility tree** (`434-r2-ax.log`, `Accessibility.getFullAXTree`):

  | the press | role | name | focusable | disabled |
  |---|---|---|---|---|
  | pale as built (`href`, `aria-disabled` true) | link | Take this road Not reached yet | true | true |
  | pale, no `href`, `aria-disabled` kept: this plan | link | Take this road Not reached yet | false | true |
  | pale, no `href`, no `aria-disabled` | link | Take this road Not reached yet | false | false |
  | pale, no `href`, `role="link"`, `tabindex="0"`, `aria-disabled` true: M1's option 2, ruled out, a record only | link | Take this road Not reached yet | true | true |
  | told, `href`, `aria-disabled` false (the control) | link | Take this road | true | false |
  | a listener-free copy of the pale press made with `cloneNode`, no `href` (the cause check) | generic | (none) | false | true |

  - In every pale arm the row's text reads, in order: "day 2", the entry's words, "Take this road", "Not reached yet".
  - The told row reads the same without the note.
- **Keyboard** (`434-r2-focus.log`; Tab sent with `sendKey` after focusing the focusable just before the press, `rr-prospect-link`):
  - pale as built: Tab lands on the press, `:focus-visible` (r1's reading, reproduced);
  - pale, staged: Tab passes over it to the next focusable, an `input.control`, and the press's `focus()` leaves focus elsewhere;
  - told: Tab lands on the press;
  - a told, focused press whose row goes untold, with its address removed in the step's own task:
    - within that task it holds focus and matches `:focus-visible`;
    - 50 ms later focus is on the body, and `blur` and `focusout` have fired on the press.
- **M1's option 2, staged** (`434-r2-focus-b.log`). Alex ruled it out, so this is a record only:
  - Tab lands on the pale press with `:focus-visible`.
  - It wears the house ring: solid 2 px `rgb(74, 56, 38)` at a 2 px offset.
  - Enter on it fired no click, opened no tab, and left its label "Take this road" and focus on it.
- **Middle-click** (`434-r2-middle.log`; `Input.dispatchMouseEvent` with the middle button at the press's centre, `elementFromPoint` on it; the browser's page list read from `/json/list`):
  - told (the control): a new tab at its Ribbon address within 100 ms;
  - pale as built: a new tab at its address within 100 ms, which is the finding reproduced;
  - pale, staged: no new tab in 3000 ms.
  - The room stayed at `/reading-room/` in all three.
- **Computed style** (`434-r2-style.log`; all properties of the press and its two spans, at rest and hovered):
  - The only differences between the pale press as built and staged are the press's and the label's `cursor`, `pointer` → `auto`.
  - The note's resolved offsets also differ, but only with where the slip had scrolled.
  - Hovered, staged: `:hover` true, `transform: none`, border `rgb(205, 189, 151)`, ground `rgb(248, 241, 224)`.
  - Told and hovered (the control): `matrix(0.999945, -0.0104718, 0.0104718, 0.999945, 0, -2)`, border `rgb(107, 90, 64)`, cursor `pointer`.

### What each step holds

`handbook/specs/settle-doctrine.md`, "What a step holds".

**RV8b**, one check, four claims, one room (seed 526413615):
1. Inbound road rows carry the press to the leg's pair, and the last entry carries none. T1 holds it only through a hand-made fixture, so it is held nowhere else.
2. Sea rows carry none. Held by T1.
3. An untold row's press stands pale and unfaded while its words fade, and is gold once told. This is CSS, held nowhere else.
4. **New:** a pale press carries no address, and a told one carries its own.
   - T3 holds it on the same module and its paint.
   - RV8b's reads at `stepTo(0)` and `stepTo(999)` show the room drives that paint.

That is two claims held nowhere else, on one room: **thin**. The edit adds no step and no `stepTo`.

**RV8c** is unchanged.

## Order of commits

The branch is `feat/434-journal-road`, resumed at 34c856dd. Its twelve commits stand.

13. `#434 Revision 2: the pale press carries no link until its row is reached (T1, T3, RV8b)`. This commit carries:
    - `handbook/plans/400/434/434-r2-plan.md`;
    - the four edits to `src/site/shared/living-chart/voyage-log-panel.ts`;
    - T1 and T3 in `test/site/reading-frame-log.test.ts`;
    - RV8b in `e2e/suites/room-voyage-route/road-press.ts`;
    - the errata line deleted from `handbook/errata/site.md`;
    - the sentence in `handbook/specs/ui-design.md`.

    Its red run comes first, as Tests says. Push.

**Then prove, with the commit in place**:
1. Unit:
   - apply M1 alone, run `npm test -- test/site/reading-frame-log.test.ts`, read the red line, and restore with `git checkout -- src/site/shared/living-chart/voyage-log-panel.ts`, which is safe because the work is committed;
   - the same for M2 and M3;
   - then T1's three mutations.
2. Browser: R-a, R-b and `434-plan.md`'s five RV8b mutations go through `npm run proof -- send`, naming the suite `room-voyage-route` and the check `RV8b`. Where the runner cannot be used, each is run locally with the suite alone, one at a time.

No other commit is planned.

## Rosters and doctrine

- **Rosters joined: none.**
  - `TIPPING_LINKS` is unchanged (C24 stands).
  - The press's class, the e2e module and the unit file each join nothing they did not join at 34c856dd.
- **Doctrine edited**: `handbook/specs/ui-design.md`, "Colour, contrast and legibility", the sentence above, per Alex's M1 ruling (comment 6647997725).
  - The ratified line "The press stays pressable rather than `disabled`, so a keyboard reader still reaches it and hears why it refuses" is kept.
  - The new sentence names this press as its one exception.
  - `grep -rniE "aria-disabled|refusing press|stays pressable|keyboard reader|still reaches" handbook/specs` (recon) finds no other line about a refusing press's keyboard reach. `explorer-doctrine.md`'s `aria-disabled` lines are the Glass hold's and the loupe press's.
- **Doctrine checked and left**:
  - **`ui-design.md` "The voice"**: its journal line, "stands pale and says "Not reached yet" to a screen reader until the voyage reaches its row", stays true. The accessibility arm reads that name on the pale press.
  - **`ui-design.md` "Gesture"**: the pale press, now no link in fact, still carries no tip.
  - **`explorer-doctrine.md`'s `roadHref` bullet**: it makes no claim about the pale state.
  - **The errata ledger**: the row leaves as "Fixed" (`handbook/errata/README.md`).

## Evidence

What remains, in this order, after commit 13:
- **Unit**:
  - the red-first run, then `npm test -- test/site/reading-frame-log.test.ts`;
  - then `npm test`;
  - then `npm run astro:generate`.
- **The rest**: `npm run check`, `npm run lint`, `npm run format:check`.
- **Browser**: `npm run build`, then `VELLUM_E2E_SUITES=room-voyage-route npm run test:e2e`, once, alone.
- **The readings retaken on the built change.** These are presentation and accessibility after the plate reader's round, so the implementing session measures them (step 15).
  1. Copy `/Users/ahl/CodeProjects/Vellum/out/434-dry-run/434-r2-probe.ts`, which the dispatcher copies there from this planner's tree, into the implementer's tree as `out/434-dry-run/434-r2-probe.ts`.
  2. Run the arms `rv8b-built`, `ax`, `focus`, `middle` and `style` on the tree's own build, each alone, as the probe's header says.
  3. On the change, the keys that must match this plan:
     - `rv8b-built`'s `ok` true with 12 of 12 pale passing;
     - `ax`'s `builtPale`: link, "Take this road Not reached yet", focusable false, disabled true;
     - `focus`'s `builtPaleTab.isPress` false;
     - `middle`'s `builtPale.newTabs` empty;
     - `style`'s `builtRest.cursor` `auto`.
  4. Quote each in the PR body with the log's name and the commit built.
- **The proofs** under Order of commits, their red lines pasted in the Guards table, each marked as proved by the implementing session only.
- **The combined state**: main has not moved from ec4f4289, which the branch already merges. If `git fetch origin` shows it moved, run `git merge --no-commit --no-ff origin/main`, then `npm test`, then `git merge --abort`, and put the result in the body (workflow step 10).
- **Steps' seconds**: RV8b's, read from the pull request's own CI run of the lane holding `room-voyage-route`, as "What a step costs" says. One run, since the step is thin: under 4 s passes.
- **`vellum-plate-reader`**: not run again. Its one round is spent (step 15), and the retaken readings above stand in for its accessibility read.
- **A new dated step 12 comment on the issue, before the PR body is edited and before the lane reports.**
  - It records C29 to C32, C34 to C36 and C38 from the Calls below, as the planner's calls.
  - It names C33 and C37 as Alex's rulings, pointing at https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6647997725 rather than restating them.
  - It says that revision 2 (`handbook/plans/400/434/434-r2-plan.md`) withdraws C28 of comment 6647103037, by that ruling.
  - It says that comments 6646499921 and 6647103037 stand unedited.
- **The PR body edits**, through `gh pr edit 1243 --body-file`, with Gate 5 read:
  - **The opening paragraph**: after "says "Not reached yet" to a screen reader only", add "and carries no link until then, so a click of any kind, a middle-click or "Open in new tab" included, opens nothing, and Tab passes over it".
  - **"Built to ..."**: name `handbook/plans/400/434/434-r2-plan.md` and the five changes this file opens with. Add https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6647404370 and https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6647997725 to the rulings it lists.
  - **"For Alex, named plainly"**: add the measured premise: the pale press stays a link to a screen reader in Chromium, unavailable and not focusable. Name C33 (the browser's own pointer) and C37 (Tab skips a pale press) as ruled in comment 6647997725, not as calls.
  - **Guards**: rows for M1, M2, M3, R-a and R-b, and T1's three re-proved mutations, each "(this session only)".
  - **Ran**: the retaken readings above.
  - **Records**:
    - the skeptic's finding 1 becomes "fixed here by Alex's ruling (comment 6647404370), and its errata row deleted";
    - the plate-reader line names the readings retaken after its round.
  - **Rulings**: add the two comments.
  - **"Look for these when you use it"**:
    - The keyboard bullet (C28) is replaced by: "**A keyboard reader**: Tab passes over a pale press and stops on it once its row is told. If you hold focus on a told press and step the voyage back past its row, focus drops to the page (C37)."
    - The middle-click bullet keeps its first sentence and replaces its second with: "On a pale press it does nothing: the press is no link until its row is told."
    - Add: "**The pointer on a pale press** is the browser's own for a thing that is not a link, not the hand (C33)."
  - Read `gh pr view 1243 --json closingIssuesReferences` after the edit: it must still list Issue #434.

## Calls made

C1 to C27 stand as `434-plan.md` and `434-r1-plan.md` write them. C28 is withdrawn (C37). These are new.
- C29 to C32, C34 to C36 and C38 are the planner's calls.
- **C33 and C37 are now Alex's rulings, not calls** (comment 6647997725). They keep their numbers so the step 12 comment and the PR body can point at them.

### C29. The address lives on the seat, and `paintSeat` alone writes it

**The rule.** The ruling, which says "no link until reached", and the one writer `434-plan.md` already gave the press's state (C19).

**Why there and nowhere else.**
- The paint runs at build and on every reveal. So a rebuilt or re-armed journal starts with no address, and needs no code of its own.
- `revealLog` is the only writer of `inked` on a prologue row (recon).

### C30. `aria-disabled` stays on the pale press, and C19 stands

**The measurement.** With its `href` gone, the pale press is still a link in Chromium, because it carries a click listener; `aria-disabled` is what marks it unavailable (`434-r2-ax.log`). Without it, a screen reader would hear an available link that Tab cannot reach.

**So the line bears load**, and C25's rule (delete a line that bears none) does not apply.

**The voice line stays true**: the name is still "Take this road Not reached yet".

### C31. The refuse branch keeps its `preventDefault` and its `q.close()`

**The rule.** The ruling moves the address, not the listener: touch only what the ruling moves.
- **`q.close()` bears load.** It is C23, held by T5's closer and measured in the browser (arm `c23`).
- **`preventDefault` is now a second refusal of an ordinary click.** It holds if a later writer ever left an address on an untold row.
- T3 and T5 read it, so it is not C25's case of a line no check can see.

### C32. RV8b sets the state it reads, and reads the address through `getAttribute`

**The rule.** `handbook/specs/settle-doctrine.md` clause 11, a check sets the state it reads, which `434-plan.md`'s C12 cites.

**Why the leg read moves.**
- It ran before RV8b's own `stepTo` and leaned on RV7's state.
- On the change, a press read at a pale state has no `href`, and `new URL(p.href)` throws on it. That would reach RV8b as "never reached its assertion" rather than as the row that failed.

### C33. No cursor rule: the pale press takes the browser's own pointer (ruled)

**Alex's ruling**, comment 6647997725: "Browser's own pointer (Recommended)". This was a planner's call. It is now ruled, and no cursor rule is added.

**The measurement.** With the address gone, the pale press's computed `cursor` is `auto`, where it was `pointer`, the hand (`434-r2-style.log`). Which glyph `auto` paints over the words is UNVERIFIABLE by a probe.

**The alternative he passed over** was `cursor: default`, the arrow, as `.place-hit` takes in `src/styles/shared/living-chart.css` while it stands inactive.

### C34. No stylesheet edit

**The measurement.** The style arm found `cursor` the only computed difference.

**The pale hover hold's `:focus-visible` half is kept.** A told, focused press whose row goes untold keeps focus and `:focus-visible` for the rest of that task, before it is blurred to the body (`434-r2-focus.log`). The hold covers that instant.

### C35. T1 and T3 carry the address, and T4, T5 and T10 are left

**The rule.** `handbook/specs/check-placement.md`, "The unit suite": the paint is the panel's own, held on the module. The readings in the T3 table are the measurement.

**Why T1 changes.** It read the address on a journal no row had reached, which the change makes null ("P alone").

### C36. The errata row for finding 1 is deleted, and no issue is filed

**The rule.** `handbook/errata/README.md`, "How a row leaves", "Fixed": the pull request that fixes a row deletes it in the same diff, and a fix that lands without deleting its row is incomplete.

**What follows.**
- The draft issue body at `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/434-issue-body.md` is not filed. Its option 1 is what this revision builds, without the role and tab stop, which Alex ruled out with M1.
- The row was added by this pull request's own commit 34c856dd and never reached main.

### C37. C28 is withdrawn (ruled)

**Alex's M1 ruling**, comment 6647997725: "Tab skips a pale button (Recommended)". What was a planner's call is now ruled.

**Why.** C28 said a focused pale press wears the house ring with no lift. A pale press no longer takes focus.

**What changes.**
- Its stills, `out/434-r1-focus/434-r1-focus-pale.png` and `434-r1-focus-pale-rest.png`, describe a state that no longer exists, and the PR body stops naming them.
- The body's keyboard bullet is replaced by the measured behaviour under Evidence.

### C38. Neither the prover nor the plate reader runs again

**The rule.** `handbook/specs/development-workflow.md` step 15: one round each, already spent. The guards this revision changes are proved by the implementing session, and the presentation change is measured by it, with this plan's probe.

## Open decisions

none.

This revision's menu was ruled in https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6647997725, recorded under **Rulings** at the top:
- **M1, "Tab skips a pale button (Recommended)".** A pale press is no Tab stop. The `ui-design.md` sentence under Files writes the house rule's one exception, and C37 withdraws C28.
- **C33, "Browser's own pointer (Recommended)".** No cursor rule.

Alex answered M1 knowing the measured correction to the ruling's premise: in Chrome a pale press with no `href` is still a link to a screen reader, named "Take this road Not reached yet", marked unavailable and not focusable.

The menu's other option, a Tab stop kept with `role="link"` and `tabindex="0"`, is not built. Its code and readings stay in `434-r2-unit-mutants.ts` and `434-r2-focus-b.log` as a record only.

## Stop conditions

Hand back, rather than adapt, on any of these:

- **The branch is not where this revision read it.** `git ls-remote origin refs/heads/feat/434-journal-road` prints a head other than 34c856ddc00b862a0170a6f8e4dcc4c8b5765aeb.
- **A file this revision edits moved on main.** `git diff --stat ec4f4289 origin/main -- src/site/shared/living-chart/voyage-log-panel.ts test/site/reading-frame-log.test.ts e2e/suites/room-voyage-route/ handbook/errata/site.md handbook/specs/ui-design.md handbook/plans/400/434/` prints a line.
- **An edit is not where this revision says.**
  - A quoted line is not in its file as quoted.
  - Or `git grep -n "roadPressParts(" -- src` finds a call other than the one in `createRoadAsk`'s `press`.
- **The unit readings differ.**
  - The red-first run reds anywhere but T3's first `href` clause.
  - The planned source and tests are not 10 pass.
  - Or M1, M2 or M3 stays green, or reds on a line its row does not name.
- **The browser readings differ on the built change.**
  - RV8b reads other than the staged fixture: `ok` true, 12 of 12 pale with `href` null, 0 rows failing.
  - RV8c reds.
  - R-a or R-b stays green.
  - Or any of `434-plan.md`'s five RV8b mutations no longer reds.
- **The retaken readings differ.** On the built change:
  - `ax`'s `builtPale` is not a link named "Take this road Not reached yet", focusable false, disabled true;
  - or `focus`'s Tab lands on a pale press;
  - or `middle` opens a tab from a pale press.
- **A check outside this suite reds.** `npm run lint`, or any check that sweeps anchors (the `a[href]` read in `e2e/suites/corners.ts`), reds on the change.
- **The step is too slow.** RV8b reads over 4 seconds on CI, which takes two more runs, or over 20, which is too slow (`handbook/specs/settle-doctrine.md`). Reworking a step is a design call.
- **The issue moved.** It holds more than 14 comments, other than this revision's plan archive (a first line beginning `Plan archive, not a ruling:`).
