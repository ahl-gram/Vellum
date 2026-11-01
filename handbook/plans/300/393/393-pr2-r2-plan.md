# Issue #393 plan, pull request 2, revision 2: the held shape box keeps its place's name, the held type select and shape box are checked, and the Prospect and the Ribbon write a written world's address clean

**Revision 2 of the second pull request's plan.** It revises `393-pr2-plan.md` as `393-pr2-r1-plan.md` left it (both on the branch at `handbook/plans/300/393/`, and on Issue #393 as comments 6560129195 and 6560129786, sha256 74205703383cf395a8be1e111cc2b173dd6f3c6869b3fdbe63d4e9dbc564b571, and comment 6560837424, sha256 213617b9889bf5a3a041ff76ddc13b65bdb6373a79a5afdf5e9a6ead081cd4c1). It answers three findings of the cold review of PR #1165, which Alex sent back to the planner. What it changes against revision 1:
- **Finding 1, reproduced in a browser and fixed.** On a sentence asking for a real place's shape, the Explorer's held shape box takes its held value before the place's name is written into it, so one keystroke empties it and Enter then drops the place from the Explorer's shape choice, which the next chart number then loses. The held value now follows the name when it is written (`holdValue` in `src/site/explorer/land-seat.ts`, called by `writeBack` in `src/site/explorer/place-picker.ts`), and Enter in a held shape box is refused.
- **Finding 2, checked.** The type select's refusal joins WR10's refusal read; the shape box's refusal and its held name are a new step, WR15.
- **Finding 4, fixed in the code, not the sentence.** The Prospect and the Ribbon rewrite their own address through `writtenParams` once, on arrival, when the sentence founds; WR13 loads a link carrying a chart number and a type beside the sentence and asserts both rooms write neither key beside it. The doctrine sentence is restated to say exactly what every room does.
- Finding 3 (the surviving `writeHash` mutation) is not reached by either fix and stays unproven, as ruled; the NITs of finding 6 are untouched.

Everything else in `393-pr2-plan.md` and `393-pr2-r1-plan.md` stands as built on the branch. This revision restates what the remaining build owes (the commits, the proofs, the evidence, the pull request's body, the step 12 record, the stop conditions), so the builder needs only this file.

**Planned at:** `origin/main` `822bb7ae7858e342a30d3ac5a6ca953213afdc54` (`git ls-remote origin refs/heads/main`), the branch `feat/393-writing-room-carry` at `b837c80083b286853a78561847f8765633f10364` (`git ls-remote origin refs/heads/feat/393-writing-room-carry`), Issue #393 read with 25 comments (`gh api repos/ahl-gram/Vellum/issues/393/comments --paginate | jq length`; the newest, 6561027201, is the step 12 record of this pull request), PR #1165 with 2 comments (6561206019, the load table; 6561206262, CD47's trail) and no review comment. Main moved since revision 1 by one commit, 822bb7ae (PR #1164, `e2e/support/skips.ts` only), which the branch already merged (3eb136ea).

**Rulings:** Alex, 2026-11-01, relayed by the dispatching session in this planner's brief, quoted: "A: planner revises for 1, 2 and 4, then merge". It was on neither Issue #393 nor PR #1165 when this plan was written (recon, item 6c); the dispatcher posts it on the issue before the implementer is briefed (`handbook/specs/orchestration.md`, "A ruling a lane will need before its own record is on the issue"). Rulings 1 to 5 of this pull request (comments 6559676010 and 6560109654) and every ruling `393-pr2-plan.md` lists bind as they stand.

**Open decisions:** none.

---

## Recon

`vellum-spec-recon` ran on 2026-11-01 against b837c800 with main at 822bb7ae. Its ledger: 21 rows, 20 CURRENT and 1 STALE, one CURRENT row (4c) carrying an UNVERIFIABLE part.
- **STALE: Alex's ruling is posted nowhere** (item 6c). It changed this plan's Rulings line, which names the relay and asks the dispatcher to post it.
- **UNVERIFIABLE (part of row 4c): whether `writtenParams` reaches the Prospect's and the Ribbon's bundle** (item 4c; recon ran no build). Settled here by building: every room's module list is unchanged by this revision (R2-M3).
- CURRENT and bearing on the plan: `controls.ts` line 78 and `place-picker.ts` line 96 are the two refusals, and no check drives either (WR10 drives only `#band`; `src/site/explorer/land-seat.ts` and `place-picker.ts` are DOM-bound at module scope and no unit test imports them); `writeBack` names a real place only inside `ready().then(...)`, while `markHeld` takes the held value at seat time, and `refreshLand` calls `showPlace` before `seatLand`; `onKeydown`'s Enter branch calls `clear()` on an empty box with no refusal; `app.ts` lines 362 and 363 are `syncHash()` then `draftOverrides`; the Prospect (`tableHash`, `chartTarget`, `ribbonTarget`, `yearHash`) and the Ribbon (`chartTarget`, `journeyHash`, `prospectTarget`) keep every key of the address they are handed, and add none; every other writer goes through `writtenParams`; main touches none of the files below; no `393-pr2-r2-plan.md` exists on the branch, on main or in the issue's archive comments; Issue #1159's plan edits `markHeld` and `seatLand` in `land-seat.ts`, keeps `refuses`, `inputsOf` and `keepsValue` unchanged, re-points WR10's note read, and names neither `place-picker.ts`, `prospect/app.ts`, `ribbon/app.ts` nor WR13.
- Recon's open items 3 and 4 are this plan's: item 3 (the doctrine sentence against the forwarding rooms) is decided by C32; item 4 (whether the held type select and shape box should refuse) was ruled by ruling 2 ("the controls are held"), and a held row refuses a press (`handbook/specs/ui-design.md`, the Broadside's Land panel), so only the checks and the hold's defect are open, and the readings below settle the defect.

## Finding 1, reproduced

Taken on the site `npm run build` made from b837c800 (`out/393-pr2-r2-dry-run/dist-head`), with `node out/393-pr2-r2-dry-run/393-pr2-r2-probe.ts out/393-pr2-r2-dry-run/dist-head head`, log `out/393-pr2-r2-dry-run/393-pr2-r2-probe-head.log`, at 1024 by 768, the sentence "tropical island in the shape of Texas" (chart 2166136261, outline `ne-1159315211`):
- On arrival the box reads `"Texas"` but holds `""`: `{"value":"Texas","held":"","inHeld":true,...}`. The held value is taken by `seatLand` before `writeBack`'s `ready().then` writes the name.
- One character typed (`Input.insertText` "x") is refused back to the held value: `{"value":"",...}`, so the box shows its placeholder, "seed's choice", while the chart is Texas.
- Enter then runs `clear()`: `{"value":"","status":"Drafting…",...}`; the redraw draws the written world again (outline still `ne-1159315211`), and the box stays `""` after the draw settles and after blur. It does not heal at the next redraw, as the review supposed: the redraw seats the empty value again.
- The cost reaches the next chart number. Released at chart 42, the control (nothing typed) keeps the shape, `{"seed":"42","type":"island","band":"tropical",...,"outline":"ne-1159315211"}` (call C11 of `393-pr2-plan.md`), and the typed path loses it, `{"seed":"42","type":"island","band":"tropical",...}` with no `outline`.
- The window is the first seat after arrival only. With a redraw first (the legend toggled), the held value is taken after the name landed and the keystroke and Enter are refused cleanly: `{"value":"Texas","held":"Texas",...,"status":""}` (`node out/393-pr2-r2-dry-run/393-pr2-r2-window.ts out/393-pr2-r2-dry-run/dist-head head`, log `393-pr2-r2-window-head.log`).

## Specs

On top of `393-pr2-plan.md`'s and `393-pr2-r1-plan.md`'s Specs lines (still binding for what they name) and what `CLAUDE.md`'s table owes:
- `handbook/specs/explorer-doctrine.md`, "The camera, the gesture and the fit", the bullet "The address is a photograph": its paragraph "A written world is spelt by its sentence alone, in every room" (this revision restates one clause).
- `handbook/specs/ui-design.md`, "The room and its furniture", the Broadside's Land panel: a held row refuses a press rather than being disabled (the rule both fixes of finding 1 keep).
- `handbook/specs/check-placement.md`, "The unit suite" (a DOM-bound module no unit test imports) and "The browser lanes and a plate read".
- `handbook/specs/settle-doctrine.md`: clauses 3 to 6 (WR15's one wait is `makeSettle` through `carryKit`'s `settle`, as WR9's is), clause 9 (every visit bounces through `about:blank`), "When a check is pulled out of the run" (the bullets "Too slow" and "Who finds a slow step", which this plan's step counts answer), and the environment bullets "Enter presses a focused button only when the key event carries its character" (WR15's Enter reaches a `keydown` listener, which reads `key` and needs no `text`, as WR10's seed Enter does) and "Focus is emulated for the whole run".
- `.claude/skills/vellum-footguns/SKILL.md` Gate 2, items 1 (the keystroke and Enter are real input events; the type and climate changes are wiring, as WR10's already is), 14 (WR15 empties the box by script to reach a window no natural gesture reaches on demand, and says so at the check), 16 and 17.
- `handbook/specs/conventions.md`, "How code is cited" and the comment rule (WR15 carries one comment line, Gate 2 item 14's).
- `handbook/specs/site-architecture.md`, "Build, check and deploy": "`MEASURED_SECONDS` is read from CI's own lane logs" (no pull request re-times a suite, so this revision writes no `MEASURED_SECONDS` commit).
- `handbook/specs/development-workflow.md` steps 8 (a revision committed beside the plans before it), 10, 12, 13 and 15 (guards added or changed after the prover's round are proven by the implementing session).

## The design

### Finding 1: the held shape box holds the name it shows (C29, C30)

**Root cause.** `refreshLand` (`src/site/explorer/shape-controls.ts`) calls `showPlace(choice.outline)` and then `seatLand(...)`. For a real place, `writeBack` writes the name only inside `ready().then(...)`, a microtask after `seatLand` has stored the box's value (`""` on a fresh page) as its held value through `markHeld`. Every refusal then restores `""`.

**The fix, two parts:**
1. **The held value follows the write-back.** A new `holdValue(input)` in `src/site/explorer/land-seat.ts`, beside `refuses` and shaped like it: when the control's row stands in the held box, each value-keeping control of the row takes its current value as its held value; a live row is left alone. `writeBack`'s `settle` calls it after writing the name. A form outline (`isFormId`) is written synchronously before `seatLand` and needs nothing.
2. **Enter is refused in a held shape box.** `onKeydown`'s Enter branch calls `refuses(box)` after `preventDefault()` and returns when it refuses. Part 1 alone leaves one way to an empty held box: a box focused before the first draw names its place (`showPlace` skips a focused box, so `markHeld` holds `""`, and the name lands only at blur); Enter there would still run `clear()`. Part 2 closes that branch whatever the held value is, which is the house's own mechanism for a held control (`refuses`), and WR15 reaches the window by emptying the box by script.

On a plain world nothing changes: the shape row is never held in a plain seat (`seatPlain` in `src/site/explorer/land-rows.ts` seats `place: "live"`), so `holdValue` returns at its guard and `refuses` returns false.

### Finding 2: the two refusals get their checks (C31)

- **The type select** joins WR10's existing refusal read: the same `evaluate` that sets `#band` to `"tropical"` with a `change` event then sets `#type` to `"island"` with a `change` event, and returns `type` beside `band` and `status`. No new page, no new wait.
- **The shape box** gets a new step, **WR15**, on its own page (`/explorer/` + `writtenHash(TEXAS, 1)`): the box's name read through `makeSettle` (WR9's read), a real keystroke (`Input.insertText` "x", as BR19 and the Print Room's shape checks type), a real Enter (`sendKey`), then the box emptied by script and Enter again. It holds three claims nowhere else held: the held box keeps its place's name through a refused keystroke (finding 1, part 1), it refuses the keystroke (finding 2, `place-picker.ts` line 96), and Enter in it neither clears the place nor starts a draw, even emptied (finding 1, part 2). One page, one Explorer arrival.
- Both live in `e2e/suites/writing-room/carry.ts` (call C10 of `393-pr2-plan.md`): `land-seat.ts` and `place-picker.ts` are DOM-bound at module scope and no unit test imports them, and the claims are what the page does under input (`handbook/specs/check-placement.md`).

**What they cost.** Lane C of the pull request's CI run 41331726493 (job 124923132169) reads WR9 3.9 s, WR10 3.4 s, WR13 6.3 s and the suite 55.0 s, each step timed from the result line before it to its own. WR10 gains one `evaluate` and WR13 none (the same two pages, a longer address). WR15 is one Explorer arrival of a shaped world and four reads: its whole sequence took 596 ms locally (`393-pr2-r2-wr15-spike.log`, the fixture arm), against WR9's two Explorer arrivals and a redraw at 3.9 s on CI. Counted as "When a check is pulled out of the run" asks: WR15 holds three claims held nowhere else on one page, WR10 and WR13 hold more than two each, so none is thin, and each is read from one CI run of the pull request (Evidence). None can be too slow under that rule, which reaches only a step of at most two such claims.

### Finding 4: the Prospect and the Ribbon write the address clean on arrival (C32, C33, C34)

**The two fixes, measured** (R2-M3, R2-M4):
- **A, the sentence alone.** No code, no byte, no check; the sentence would have to say that a room passing its address on keeps a hand-written identity key beside the sentence, which call C4 of `393-pr2-plan.md` ("Identity keys beside a sentence are ignored and never written beside one"), put before Alex in the step 12 record (comment 6561027201), says no room does.
- **B, the code.** The Prospect and the Ribbon each rewrite their own address once, directly after `foundAddress`, through `writtenParams`, when the sentence founds: `if (written !== null) history.replaceState(null, "", "#" + writtenParams(new URLSearchParams(location.hash.slice(1)), written).toString());`. Every later writer and road in both rooms keeps the address it is handed, so all of them then write it clean. Cost: the Prospect 160 raw and 44 compressed bytes, the Ribbon 160 and 40; every other room 0; every room's module list unchanged (the module probe exits 0 with `gained: [], lost: []` for all seven rooms against revision 1's `393-pr2-r1-modules-b.log`), since `writtenParams` lives in `src/site/shared/written-world.ts`, which both rooms already load.

**This plan builds B**, and restates the doctrine clause to what B makes true: every room that founds the sentence writes none of the identity keys beside it, in its own address or in a road it lays, whatever the link it arrived on carried. Read on the spike for every room that founds, on the mixed link (R2-M6): the Explorer's address, its Print Room and Reading Room roads and a place card's Prospect road; the Print Room's address and its roads to the Explorer and the Portfolio; the Reading Room's address; the Prospect's and the Ribbon's addresses and roads to the Explorer (WR13's fixture) all carry `found` and `v` and no identity key. The Explorer's Chart Table road is built at its press from the Explorer's own address (`tableHash(window.location.hash, ...)` in `src/site/explorer/chart-drawer-bind.ts`), which reads clean; the Writing Room writes `found` and `v` alone. The Explorer's forward of a `year` link to the Reading Room (`forwardTarget` in `src/site/explorer/address.ts`) passes a link on before the Explorer founds anything, and the Reading Room writes its address through `writtenParams`, so "every room that founds the sentence" covers it. A refused sentence leaves the address alone (`written` is `null`), as C3 of `393-pr2-plan.md` reads a refused sentence as absent.

### Finding 3: not reached (C35)

Neither fix nor any new read reaches it. The mutation (`heldFor(writtenNow(), seed)` to `writtenNow()` in `writeHash`) changes only the address written between a new chart number's `syncHash` (`app.ts` line 362) and `draftOverrides`'s release (line 363), or after a failed draw; WR10 reads the address after the new chart lands, WR15 never changes the chart number, and WR13 reads other rooms. It stays UNPROVEN, as the pull request body says and as Alex's ruling leaves it. A guard would be cheap (WR10 already makes the move; a tap on `history.replaceState` from before the Enter would read every address written after it), and is not built: it is outside the ruling.

### Rejected alternatives

- *The held shape box `readOnly` while held*: a second mechanism beside `refuses` for one row; the house's held rows refuse a press, one way.
- *`refuses(box)` re-running `writeBack` in place of a held value*: `land-seat.ts` would call into `place-picker.ts`, which imports it; and the held value would still be wrong for any other reader of it.
- *`place-picker.ts` writing `dataset["held"]` itself*: two files would own the held value; `land-seat.ts` writes it in `markHeld` and reads it in `refuses`, so it writes it here too.
- *Seating the land after the name is known* (awaiting the name index in `refreshLand`): every draw on a shaped world would wait on a promise for one box's text, and the focused-box path would still hold `""`.
- *Part 1 without part 2*: leaves `clear()` reachable on a box focused before the first draw named it (above).
- *WR15's claims inside WR9's step*: saves one Explorer arrival, but WR9's check would then red on finding 1's, finding 2's and the Enter guard's mutations as well as its own, and WR9 is unchanged by this revision.
- *Finding 4 by the sentence alone (A)*: contradicts call C4, which the house's step 12 record put before Alex; B costs 160 raw bytes in two rooms and no module.
- *Finding 4 by routing `yearHash`, `journeyHash`, `tableHash` and the roads through `writtenParams`*: six call sites in place of two lines, and `tableHash` (`src/site/shared/table-address.ts`) is shared with the Explorer's Chart Table and the Portfolio, which loads none of the founding (the Portfolio's list would gain `written-world.ts` and the founding modules, revision 1's bound).
- *A guard for finding 3 now*: outside the ruling (above).

## Files

All edits are on the branch as it stands at b837c800. Each source and check file's text below is exactly the spike's (`out/393-pr2-r2-dry-run/393-pr2-r2-spike.diff`, copied to the main checkout's `out/393-pr2-r2-dry-run/` when this planner's tree is retired), after `npm run format`.

**`src/site/explorer/land-seat.ts`**: directly above `export function refuses(input: Held): boolean {`, add
```ts
export function holdValue(input: Held): void {
  const row = input.closest(".l-row");
  if (row === null || row.closest(".held") === null) return;
  for (const each of inputsOf(row)) if (keepsValue(each)) each.dataset["held"] = each.value;
}

```
(the guard is `refuses`'s own; `each` is a loop variable because `no-param-reassign` refuses a write to a property of `input`). Nothing else in the file changes.

**`src/site/explorer/place-picker.ts`**:
- `import { refuses } from "./land-seat.ts";` becomes `import { holdValue, refuses } from "./land-seat.ts";`.
- In `writeBack`, the line `    if (shapeChoice().outline === id) box.value = value;` inside `settle` becomes the three lines
```ts
    if (shapeChoice().outline !== id) return;
    box.value = value;
    holdValue(box);
```
- In `onKeydown`, the Enter branch gains `    if (refuses(box)) return;` directly after its `    e.preventDefault();`, before `    const hit = hits[lit];`.

**`src/site/prospect/app.ts`**:
- `import { foundAddress, pageFounder } from "../shared/written-world.ts";` becomes `import { foundAddress, pageFounder, writtenParams } from "../shared/written-world.ts";`.
- Directly after `const written = await foundAddress(location.hash, pageFounder());`, the two lines
```ts
if (written !== null)
  history.replaceState(null, "", "#" + writtenParams(new URLSearchParams(location.hash.slice(1)), written).toString());
```

**`src/site/ribbon/app.ts`**: the same import change and the same two lines, directly after its `const written = await foundAddress(location.hash, pageFounder());`.

**`e2e/suites/writing-room/carry.ts`**:
- In `wr10Hold`, the `refused` read becomes
```ts
  const refused = await k.evaluate<{ band: string; type: string; status: string }>(
    `(() => { const b = document.getElementById("band"), t = document.getElementById("type"); b.value = "tropical"; b.dispatchEvent(new Event("change", { bubbles: true })); t.value = "island"; t.dispatchEvent(new Event("change", { bubbles: true })); return { band: b.value, type: t.value, status: document.getElementById("status").textContent }; })()`,
  );
```
  its check's sentence becomes "WR10 a written world holds the Explorer's Land panel under the sentence's note and refuses a change of its type or its climate, and a new chart number lets it go with its settings", and `refused.type === "archipelago" &&` joins the conjunction directly after `refused.band === "polar" &&`.
- Directly after `wr14Road` and before `const PRINT_SETTLED`, the new check:
```ts
type Place = { readonly value: string; readonly held: boolean; readonly status: string };

const PLACE_READ = `(() => { const b = document.getElementById("place"); return { value: b.value, held: !!b.closest(".held"), status: document.getElementById("status").textContent }; })()`;

export async function wr15PlaceHeld(k: WritingKit): Promise<void> {
  const { explorer, settle } = carryKit(k);
  await explorer(writtenHash(TEXAS, 1));
  const named = await settle<string>(
    `document.getElementById("place").value`,
    (d, last) => d !== "" && d === last,
    "the shape box to name the founded place",
    POLLS,
  );
  await k.evaluate(
    `(() => { const b = document.getElementById("place"); b.focus(); return document.activeElement === b; })()`,
  );
  await k.send("Input.insertText", { text: "x" });
  const typed = await k.evaluate<Place>(PLACE_READ);
  await sendKey(k.send, "Enter", "Enter", 13);
  const entered = await k.evaluate<Place>(PLACE_READ);
  // Emptied by script: it stands for a box focused before the first draw named its place, a window no natural gesture reaches on demand.
  await k.evaluate(`(() => { document.getElementById("place").value = ""; return true; })()`);
  await sendKey(k.send, "Enter", "Enter", 13);
  const emptied = await k.evaluate<Place>(PLACE_READ);
  k.check(
    "WR15 a written world's held shape box names its place and keeps it through a refused keystroke, and Enter in it neither clears the place nor starts a draw, even with the box emptied",
    named === "Texas" &&
      typed.held &&
      typed.value === "Texas" &&
      entered.value === "Texas" &&
      entered.status === "" &&
      emptied.value === "Texas" &&
      emptied.status === "",
    `named "${named}"; typed ${JSON.stringify(typed)}; Enter ${JSON.stringify(entered)}; emptied, then Enter ${JSON.stringify(emptied)}`,
  );
}

```
- Directly after `type Named = { readonly index: number; readonly name: string };`, add
```ts
type Links = { readonly hash: string; readonly road: string | null };

const MIXED = "&seed=5&type=island";

const writtenOnly = (link: string | null): boolean => {
  const p = new URLSearchParams((link ?? "").split("#")[1] ?? "");
  return p.get("found") === FLAGSHIP && IDENTITY.every((key) => !p.has(key));
};
```
- In `wr13Names`: both `visit` calls gain `+ MIXED` after `writtenHash(FLAGSHIP, 1)`; the Prospect's read becomes `k.evaluate<Named & Links>(` with `, road: document.getElementById("pp-chart-link").getAttribute("href")` added after `hash: location.hash` in its returned object; the Ribbon's read becomes `k.evaluate<{ from: number; to: number; fromName: string; toName: string } & Links>(` with `, hash: location.hash, road: document.getElementById("rb-chart-link").getAttribute("href")` added after `toName: pick("rb-to")`; the check's sentence becomes "WR13 the Prospect and the Ribbon draw a written world's places by its own names from a link that also carries a chart number and a type, and write neither key beside the sentence in their address or their road to the Explorer"; and its conjunction becomes `plate.name === names[String(plate.index)] && writtenOnly(plate.hash) && writtenOnly(plate.road) && ribbon.fromName === names[String(ribbon.from)] && ribbon.toName === names[String(ribbon.to)] && writtenOnly(ribbon.hash) && writtenOnly(ribbon.road)` (one conjunct a line, as `npm run format` writes it; `plate.hash.startsWith("#found=")` leaves). The detail string is unchanged.

**`e2e/suites/writing-room.ts`**: `wr15PlaceHeld,` joins the import list from `./writing-room/carry.ts` directly after `wr14Road,`; `  await step("WR15", () => wr15PlaceHeld(k));` directly after the `WR14` step, before `Emulation.clearDeviceMetricsOverride`.

**`handbook/specs/explorer-doctrine.md`**, line 298, the clause
"A link carrying `found` and `v` is founded again wherever it lands (`foundAddress` in `src/site/shared/written-world.ts`); no room writes an identity key (`seed`, `type`, `band`, `land`, `coast` or a shape key) beside it, and a link carrying both draws the sentence's world (`writtenParams` in `src/site/shared/written-world.ts`);"
becomes
"A link carrying `found` and `v` is founded again wherever it lands (`foundAddress` in `src/site/shared/written-world.ts`), and a link that also carries an identity key (`seed`, `type`, `band`, `land`, `coast` or a shape key) draws the sentence's world; every room that founds the sentence writes none of those keys beside it, in its own address or in any road it lays, whatever the link it arrived on carried (`writtenParams` in `src/site/shared/written-world.ts`);"
Nothing else on the line changes.

**`handbook/plans/300/393/393-pr2-r2-plan.md`**: this file, copied unchanged from the scratchpad, beside the three plans the branch carries, which are never edited.

No other file changes. Sizes after the edits (raw lines): `land-seat.ts` 102, `place-picker.ts` 159, `prospect/app.ts` 216, `ribbon/app.ts` 144, `carry.ts` 376; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` over the six touched source and check files exits 0 on the spike (`lint-spike.log`), so no file passes 400 counted lines and no function 50.

## Tests, in the order they are written

**The prover's and the cold skeptic's one round on this pull request is spent** (workflow step 15). Every check this revision adds or changes (WR10, WR13, WR15) is proven by the implementing session, by breaking the behaviour it guards with the work committed first, and the body names each as "proven by the implementing session". No unit test is added or changed: `land-seat.ts`, `place-picker.ts` and the two rooms' `app.ts` are DOM-bound or top-level-await page modules no unit test imports.

**Red first.** The checks are written at commit A against the branch's code; WR15 and WR13 red there on their assertions, and WR10 stays green (it guards a refusal the code already has; P4 proves it bites). Predicted by running this revision's checks against the site built from b837c800: `VELLUM_SITE_DIR=/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a7a8326bd2f6c699c/out/393-pr2-r2-dry-run/dist-head VELLUM_E2E_SUITES=writing-room npm run test:e2e`, log `out/393-pr2-r2-dry-run/e2e-writing-room-head.log`, `SOME FAILED (14/16)`, exactly WR13 and WR15.

Every reading below is a check's own read or a probe taking the same reads, on two sites `npm run build` made in this planner's tree: b837c800 as it stands (`dist-head`, `build-head.log`) and b837c800 plus the uncommitted spike (`dist-spike`, `build-spike.log`, the diff `393-pr2-r2-spike.diff`), all under `out/393-pr2-r2-dry-run/`. Each assertion is an equality of strings or a boolean, so each fails by a whole value and none sits near its line.

**WR15** (`e2e/suites/writing-room/carry.ts`, `wr15PlaceHeld`; step `WR15` in `e2e/suites/writing-room.ts`), its sentence as under Files.
- Fixture (the spike): `node out/393-pr2-r2-dry-run/393-pr2-r2-wr15.ts out/393-pr2-r2-dry-run/dist-spike spike`, log `393-pr2-r2-wr15-spike.log`: named `"Texas"`; typed `{"value":"Texas","held":true,"status":""}`; Enter `{"value":"Texas","held":true,"status":""}`; emptied, then Enter `{"value":"Texas","held":true,"status":""}`; and the check itself PASS in `e2e-writing-room-spike.log`.
- The fix reverted, both parts (the branch's code, which is P1's reading on the `typed` read): FAIL in `e2e-writing-room-head.log`, typed `{"value":"","held":true,"status":""}`, Enter `{"value":"","held":true,"status":"Drafting…"}`, emptied `{"value":"","held":true,"status":"Drafting…"}`.
- The keystroke's refusal removed (P2), staged on the spike by moving the shape row out of the held box before the keystroke, a broader stand-in (it also frees the box's Enter): typed `{"value":"Texasx","held":false,"status":""}` (the list opened), failing.
- The Enter guard removed (P3), staged on the spike by moving the shape row out of the held box after the first Enter and focusing the box again (a moved element loses focus), a broader stand-in: typed and Enter as the fixture, emptied `{"value":"","held":true,"status":"Drafting…"}`, failing on the emptied read alone.
- Mutations the implementing session proves, each alone, each red on WR15 alone: **P1** `holdValue(box);` deleted from `writeBack`'s `settle` in `src/site/explorer/place-picker.ts` (typed `""`); **P2** in `onInput`, the line `if (refuses(box)) return;` directly above `edited = true;` deleted (typed `"Texasx"`); **P3** in `onKeydown`'s Enter branch, the line `if (refuses(box)) return;` directly above `const hit = hits[lit];` deleted (emptied `""`, `"Drafting…"`). The file holds two `if (refuses(box)) return;` lines after commit B, so a proof row names each by the line below it (a find of `if (refuses(box)) return;\n    const hit` for P3, of `if (refuses(box)) return;\n  edited` for P2).

**WR10** (`wr10Hold`), the type select's half.
- Fixture: `node out/393-pr2-r2-dry-run/393-pr2-r2-probe.ts out/393-pr2-r2-dry-run/dist-spike spike`, log `393-pr2-r2-probe-spike.log`, `{"type":"archipelago","status":""}` (the same on `dist-head`, which has the refusal); the check PASS in `e2e-writing-room-spike.log`.
- Mutation, staged by moving the type row out of the held box before the change: `{"type":"island","status":"Drafting…"}`, failing on both.
- **P4** `    if (refuses(typeSel)) return;` deleted from `typeSel`'s listener in `src/site/explorer/controls.ts`: red on WR10 alone.

**WR13** (`wr13Names`), on the mixed link `writtenHash(FLAGSHIP, 1) + "&seed=5&type=island"`.
- Fixture (the spike): the check PASS in `e2e-writing-room-spike.log`; the probe: the Prospect `{"seed":1858074817,"index":0,"name":"Gaurnfjord","hash":"#found=a+cold+archipelago+of+black+pines%2C+iron+harbors%2C+and+a+drowned+kingdom&v=1","road":"/explorer/#found=a+cold+archipelago+of+black+pines%2C+iron+harbors%2C+and+a+drowned+kingdom&v=1"}`, the Ribbon `from` 0 and `to` 20, hash `#found=...&v=1&a=0&b=20`, road `/explorer/#found=...&v=1`, no identity key in either.
- The fix reverted (the branch's code): FAIL in `e2e-writing-room-head.log`, the names still `Gaurnfjord` and `Sko` (the sentence's world wins on both builds), the Prospect hash and road `...&v=1&seed=5&type=island`, the Ribbon hash `...&v=1&seed=5&type=island&a=0&b=20` and road `...&v=1&seed=5&type=island`.
- A room reading no sentence on this link (the prover's earlier `written = null` row), staged by the link without `found` and `v` (`node out/393-pr2-r2-dry-run/393-pr2-r2-wr13-old.ts out/393-pr2-r2-dry-run/dist-spike`, log `393-pr2-r2-wr13-old.log`): the Prospect index 0 `"Stil"` against `"Gaurnfjord"`; the Ribbon 0 and 8, `"Stil"` and `"Zvadgungrad"`, against the flagship's names at 0 and 8; failing.
- **P5** the two lines added directly after `foundAddress` deleted in `src/site/prospect/app.ts`; **P6** the same in `src/site/ribbon/app.ts`; **P7** `await foundAddress(location.hash, pageFounder())` replaced by `await foundAddress("", pageFounder())` in `src/site/prospect/app.ts`; **P8** the same in `src/site/ribbon/app.ts`. Each red on WR13 alone.

No reading of this revision is UNVERIFIABLE: every change is staged or built, and every check's mutation reading falls on the failing side.

## Order of commits

The branch carries ten commits on main (`git log --oneline origin/main..b837c800` lists them: the six of `393-pr2-plan.md`, revision 1 at fa6393a8, the merge of main at 3eb136ea, skeptic finding 5 at 7b1e2a83, and `MEASURED_SECONDS` at b837c800). The builder resumes `feat/393-writing-room-carry` at b837c800 as its definition says (`git fetch origin feat/393-writing-room-carry`, then `git checkout -B feat/393-writing-room-carry origin/feat/393-writing-room-carry`, each its own command), once the dispatcher says the tree that holds it, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a8d7394de35593714`, is retired. Then:

A. `#393 Revision 2 of the second pull request's plan, and the checks for the held shape box, the held type select and a mixed link in the Prospect and the Ribbon`: `handbook/plans/300/393/393-pr2-r2-plan.md`; the `carry.ts` and `writing-room.ts` edits under Files. `npm run check`, `npm run lint`, `npm run format:check`; `npm run build`; `VELLUM_E2E_SUITES=writing-room npm run test:e2e > out/393-pr2-r2-dry-run/e2e-writing-room-A.log 2>&1`: `SOME FAILED (14/16)`, exactly WR13 and WR15, with the reads quoted under Tests. Push.
B. `#393 The held shape box keeps its place's name and refuses Enter, and the Prospect and the Ribbon write a written world's address clean on arrival`: the `land-seat.ts`, `place-picker.ts`, `prospect/app.ts`, `ribbon/app.ts` and `explorer-doctrine.md` edits under Files. Then Evidence, in its order. Push.

No `MEASURED_SECONDS` commit (`handbook/specs/site-architecture.md`: no pull request re-times a suite). No commit message carries a closing keyword; the body keeps `Closes #393`.

## Rosters and doctrine

**Rosters**: none joined. WR15 is a step of an existing suite; `git grep -n "WR10\|WR13\|WR15\|WR9\b" -- . ':!handbook/plans'` finds the check names only in `e2e/suites/writing-room.ts` and `carry.ts` (beside base64 text in `design/` archives), so no proof row, flake row or skip names a sentence this revision changes. `E2E_SKIPS` is untouched.

**Doctrine**: the one clause under Files (`handbook/specs/explorer-doctrine.md` line 298). `handbook/specs/ui-design.md`'s Broadside paragraph already says a held row refuses a press, which the fix keeps; nothing there changes.

## Evidence

Every local run writes its output to a file under `out/393-pr2-r2-dry-run/` in the builder's tree and is read from there. Copy the probes first, each command alone: `mkdir -p out/393-pr2-r2-dry-run`; then `cp /Users/ahl/CodeProjects/Vellum/out/393-pr2-r2-dry-run/393-pr2-closure.ts /Users/ahl/CodeProjects/Vellum/out/393-pr2-r2-dry-run/393-pr2-r1-modules.ts /Users/ahl/CodeProjects/Vellum/out/393-pr2-r2-dry-run/393-pr2-r1-modules-b.log /Users/ahl/CodeProjects/Vellum/out/393-pr2-r2-dry-run/393-pr2-r2-closure-spike.log /Users/ahl/CodeProjects/Vellum/out/393-pr2-r2-dry-run/393-pr2-r1-closure-main.log out/393-pr2-r2-dry-run/` (they import only Node built-ins).

After commit B:
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (3491 of 3491, as on the spike, `unit-spike.log`), then `npm run astro:generate`.
- `git diff --stat origin/main -- src/world/` prints nothing; `NAMES_CHECKSUM` reads 2151669449 in `src/site/shared/founding-names.ts`.
- `npm run build`, then:
  - `node out/393-pr2-r2-dry-run/393-pr2-r1-modules.ts dist out/393-pr2-r2-dry-run/393-pr2-r1-modules-b.log > out/393-pr2-r2-dry-run/393-pr2-r2-modules-built.log`: exit 0, every room's `gained` and `lost` `[]` (revision 1's bound, unchanged);
  - `node out/393-pr2-r2-dry-run/393-pr2-closure.ts dist > out/393-pr2-r2-dry-run/393-pr2-r2-closure-built.log`, then `diff out/393-pr2-r2-dry-run/393-pr2-r2-closure-built.log out/393-pr2-r2-dry-run/393-pr2-r2-closure-spike.log`: predicted to print nothing (the press is byte-reproducible, and the four source files are the spike's text). A difference with the module lists equal is no stop: the pull request comment below gives both lines for each room that differs.
- Then, one at a time, each to its own log: `VELLUM_E2E_SUITES=<suite> npm run test:e2e` for `writing-room` (16 of 16, ALL PASS), `broadside` (the shape box and the Land panel on plain worlds), `prospect`, `ribbon` and `room-address` (the two rooms' arrival). Never the full local lanes.
- The proofs, with commit B pushed and the tree clean: P1 to P8 under Tests, each alone. Locally, each is: the edit; `npm run build`; `VELLUM_E2E_SUITES=writing-room npm run test:e2e > out/393-pr2-r2-dry-run/proof-P<n>.log 2>&1`, red on its named check alone; `git checkout -- <file>`; `git status --porcelain` printing nothing. Or as one list on the proof runner (`npm run proof -- send`, workflow step 11), each row one find-and-replace with the selection `writing-room` and its one expected red named exactly (P1 to P3: WR15; P4: WR10; P5 to P8: WR13), read back with `npm run proof -- read <run>`. Either way the body names each as proven by the implementing session, with its red line pasted.
- `vellum-plate-reader` is not owed: no frame it measured changes (the arrival box reads `"Texas"` on both builds, R2-M1), and the fix is to what a keystroke does, which WR15 reads.
- The golden and every committed chart unmoved: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`.
- After the push, the step seconds of WR10, WR13 and WR15 from the pull request's CI lane C log (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), each from the result line before it to its own result line, beside this plan's before-readings (WR10 3.4 s, WR13 6.3 s, from job 124923132169), in the pull request comment below. One run each (none is thin).
- `gh pr view 1165 --json closingIssuesReferences` lists #393.

**A pull request comment**, once commit B's CI has run (workflow step 10): the per-room load table of R2-M4 with the builder's closure lines beside it, the module probe's output, the two scripts' paths and commands, and the three step readings above.

**The pull request's body**, edited (`gh pr edit 1165 --body-file`, then read back with `gh pr view 1165 --json body` in its own command), in the template's shape, changing only:
- The opening paragraph: "The branch carries two plans" becomes "The branch carries three plans", adding `393-pr2-r2-plan.md` and what it changed (findings 1, 2 and 4 of the cold review, Alex 2026-11-01: "A: planner revises for 1, 2 and 4, then merge"); the four rooms' load becomes "9,523 to 9,758 compressed bytes more (4.78 to 5.57 percent)" and the Explorer's is named, 10,005 (4.46 percent), from R2-M4.
- **Guards**: WR10's row names both refusals; new rows for WR10's type half (P4), WR13's mixed link (P5 to P8) and WR15 (P1 to P3), each "proven by the implementing session" with its red line.
- The "Not proven" paragraph: its last sentence ("Also untested: WR10 drives only the band select, ...") leaves; finding 3's sentence stays, adding "left unproven as ruled (Alex, 2026-11-01)".
- **Ran**: the unit count, the suites under Evidence by name with their results, the module and closure probes.
- **Records**: the prover's line gains "guards changed or added after its round: WR10, WR13, WR15, proven by the implementing session (P1 to P8)"; the skeptic's line moves findings 1, 2 and 4 to "fixed in revision 2 (`393-pr2-r2-plan.md`)", finding 1 "reproduced in a browser first", and keeps finding 3 unproven and finding 6's NITs left; the plate reader's line keeps "presentation fixes after its round: none".
- **Rulings**: the step 12 comment's link gains the new comment's link (below) and "the planner's calls C29 to C41 in `393-pr2-r2-plan.md`"; open decisions: none.
- **Look for these when you use it**: adds "on a sentence asking for a real place's shape, the held shape box keeps the place's name, and a keystroke or Enter in it changes nothing".

**The step 12 record**, a new dated comment on Issue #393 before the body is edited (the earlier one is never edited): calls C29 to C41 below, pointing at Alex's ruling where the dispatcher posted it, or saying it was ruled in the session and relayed where it is posted nowhere (`.claude/agents/vellum-implementer.md`).

## Calls made

`393-pr2-plan.md`'s C1 to C16 and `393-pr2-r1-plan.md`'s C17 to C28 stand. This revision adds, each for Alex to overrule:
- **C29. Finding 1 is fixed by the held value following the write-back** (`holdValue` beside `refuses`, called by `writeBack`'s `settle`). Rule: ruling 2 ("the controls are held") and the house's one mechanism for a held control, `refuses` over the held value `markHeld` writes (`handbook/specs/ui-design.md`, a held row refuses a press); the held value is `land-seat.ts`'s, so `land-seat.ts` writes it.
- **C30. Enter is refused in a held shape box as well**, though part 1 already stops a keystroke emptying it. Rule: a box focused before the first draw names its place holds `""` whatever part 1 does (`showPlace` skips a focused box), and `clear()` from there drops the shape the next chart number keeps (the readings under "Finding 1, reproduced"); WR15 reaches that window by emptying the box by script (`vellum-footguns` Gate 2 item 14).
- **C31. The type select's refusal joins WR10's refusal read; the shape box's hold and refusal are a new step, WR15, on its own page**, both in `carry.ts`. Rule: `handbook/specs/check-placement.md` (DOM-bound modules no unit test imports; what the page does under input is read in a browser); call C10 (the carry's checks live in the writing-room suite's part file); a step of its own keeps each of P1 to P3 red on WR15 alone and leaves WR9 as ruled and proven.
- **C32. Finding 4 is fixed in the code (B), and the doctrine clause is restated to what B makes true.** Rule: call C4 ("never written beside one"), before Alex in the step 12 record; measured cost 160 raw and 44 and 40 compressed bytes in the Prospect and the Ribbon, no module gained or lost in any room (R2-M3, R2-M4).
- **C33. B is one rewrite of the room's own address on arrival**, not a change to `yearHash`, `journeyHash`, `tableHash` and the roads. Rule: each later writer keeps the address it is handed, so one statement per room covers all of them; `tableHash` is shared with the Explorer's Chart Table and the Portfolio, whose load the founding would otherwise join.
- **C34. WR13 loads the mixed link in place of the plain one**, and asserts the address and the road to the Explorer in both rooms. Rule: no new page (`handbook/specs/settle-doctrine.md`, "One honest fix": a set-up shared, not repeated); the names half still reds a room that reads no sentence (`Stil` against `Gaurnfjord`).
- **C35. Finding 3 gets no guard here.** Rule: Alex's ruling names findings 1, 2 and 4; neither fix reaches the window the mutation changes.
- **C36. Finding 6's NITs are left.** Rule: no fix here touches those lines (`readAddress`'s doc block, the four rooms' overrides ternary, U3b), and a NIT is fixed only where cheap (workflow step 15).
- **C37. No `MEASURED_SECONDS` change.** Rule: `handbook/specs/site-architecture.md`, no pull request re-times a suite; lane C read 55.0 s for the suite against the table's 44.0 on the pull request's own run, which whoever reads a lane grown lopsided may edit.
- **C38. No plate read is owed.** Rule: no frame the plate reader measured changes (the arrival box reads `"Texas"` on both builds); what changes is what a keystroke and Enter do, which WR15 reads.
- **C39. WR10, WR13 and WR15 are proven by the implementing session**, locally or on the proof runner. Rule: workflow step 15 (the prover's one round is spent).
- **C40. The held box's and the address's fixes land in one commit after the red one**, with the doctrine. Rule: workflow step 8, the failing checks first; the doctrine moves with the code.
- **C41. The writing-room suite now ends on the Explorer** (WR15's Texas page, the shape box focused, no draw in flight), where it ended on the Writing Room; `corners` runs after it in lane C. Rule: `handbook/specs/settle-doctrine.md` clause 14 (a suite's last navigation waits for readiness, which WR15's `explorer` does); `corners` is in neither `NEEDS_PREDECESSOR` nor `OPENS_ON_HOME` (`e2e/support/suites.ts`). Lane order is not run locally (the suite ran alone); the pull request's CI run reads it, and a lane-order red there is read as that clause says, by bisecting the order.

## Open decisions

None.

## Lanes beside this one

- **Issue #1159** (the Broadside's build; its planner is queued behind this pull request, and its plan, archived as comments 6560267664 and 6560268281, is planned again once this merges). It rewrites `markHeld` (a third parameter) and `seatLand` in `src/site/explorer/land-seat.ts` and keeps `refuses`, `inputsOf` and `keepsValue` as they are; `holdValue` stands directly above `refuses` and reads the same three, so its planner keeps it as it keeps `refuses`. WR15 reads the shape box's held state as `closest(".held")`, which survives a held box split in two as long as each is `.held`; WR10's type half reads only the two selects' values and `#status`, so its re-pointing of WR10's note read is unchanged by this revision. Its planner adds WR15 to the checks it reads before it builds.
- **Issue #1129** (a coast of 0.55 spelt one way): unchanged; this revision touches no address grammar.

## Stop conditions

Hand back, with the command and its output, when:
- the branch's head is not b837c800 when the builder resumes it, or `git ls-remote origin refs/heads/main` prints a sha other than 822bb7ae and `git diff --stat 822bb7ae origin/main` touches any file under Files;
- at commit A the writing-room suite reds anything but exactly WR13 and WR15, or either reds with a read other than the ones under Tests;
- at commit B the writing-room suite is not 16 of 16, or any suite under Evidence reds (with its log; nothing is run again);
- `node out/393-pr2-r2-dry-run/393-pr2-r1-modules.ts dist out/393-pr2-r2-dry-run/393-pr2-r1-modules-b.log` exits 1;
- `npm test` is not 3491 of 3491, or `npm run lint` reports a file over 400 lines or a function over 50;
- `git diff --stat origin/main -- src/world/` prints anything, or `NAMES_CHECKSUM` is not 2151669449;
- any of P1 to P8 does not red its named check, or reds another check beside it;
- a symbol or line this plan names is not where it says (`refuses(typeSel)` in `controls.ts`, `refuses(box)` in `onInput`, `writeBack`'s `settle`, the two rooms' `const written = await foundAddress(location.hash, pageFounder());`, the doctrine clause at `explorer-doctrine.md` line 298).

## Measurements

Taken in this planner's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a7a8326bd2f6c699c`, detached at b837c800), on two sites `npm run build` made there and kept as `out/393-pr2-r2-dry-run/dist-head` and `dist-spike`. Every file below is in `out/393-pr2-r2-dry-run/`, copied to the main checkout's `out/393-pr2-r2-dry-run/` when the tree is retired. No suite ran beside another; the machine held no other browser (`ps aux | grep -c '[r]emote-debugging-port'` printed 0 before the suite runs).

- **R2-M1. Finding 1** (`393-pr2-r2-probe.ts`, logs `393-pr2-r2-probe-head.log` and `393-pr2-r2-probe-spike.log`; `393-pr2-r2-window.ts`, log `393-pr2-r2-window-head.log`): the readings under "Finding 1, reproduced", and on the spike every read of the same sequence `{"value":"Texas","held":"Texas",...,"status":""}`, the release at chart 42 keeping `outline=ne-1159315211` on the typed path as on the control. The arrival read is `"value":"Texas"` on both builds; only the held value differs (`""` against `"Texas"`).
- **R2-M2. The checks** (`e2e-writing-room-spike.log`: `ALL PASS (16/16)`, the suite 16.8 s locally; `e2e-writing-room-head.log`, this revision's checks against `dist-head`: `SOME FAILED (14/16)`, WR13 and WR15; `393-pr2-r2-wr15.ts`, logs `393-pr2-r2-wr15-spike.log` and `393-pr2-r2-wr15-head.log`; `393-pr2-r2-wr13-old.ts`, log `393-pr2-r2-wr13-old.log`): the readings under Tests. No console error and no 4xx in any probe.
- **R2-M3. Each room's modules** (`node out/393-pr2-r2-dry-run/393-pr2-r1-modules.ts <site> out/393-pr2-r2-dry-run/393-pr2-r1-modules-b.log`, logs `393-pr2-r2-modules-head.log` and `393-pr2-r2-modules-spike.log`): exit 0 on both, every room `"gained":[],"lost":[]` (explorer 312 modules, print-room 277, reading-room 294, prospect 267, ribbon 263, writing-room 255, explorer/portfolio 254).
- **R2-M4. Each room's main-thread load** (`node out/393-pr2-r2-dry-run/393-pr2-closure.ts <site>`, logs `393-pr2-r2-closure-head.log` and `393-pr2-r2-closure-spike.log`; tabulated in `393-pr2-r2-table.log`; main's column is revision 1's `393-pr2-r1-closure-main.log` at 781e861c, and main has moved since only in `e2e/support/skips.ts`, which no bundle reads). The head's log equals revision 1's `393-pr2-r1-closure-b.log` byte for byte. Bytes raw / compressed:

  | room | main | the head (b837c800) | this revision | over main | over the head |
  |---|---|---|---|---|---|
  | Explorer | 823,206 / 224,093 | 855,587 / 234,066 | 855,863 / 234,098 | +32,657 / +10,005 (3.97 / 4.46 %) | +276 / +32 |
  | Print Room | 691,742 / 185,885 | 723,103 / 195,643 | 723,103 / 195,643 | +31,361 / +9,758 (4.53 / 5.25 %) | 0 / 0 |
  | Reading Room | 755,560 / 203,929 | 786,897 / 213,668 | 786,897 / 213,668 | +31,337 / +9,739 (4.15 / 4.78 %) | 0 / 0 |
  | Prospect | 665,122 / 178,010 | 695,995 / 187,614 | 696,155 / 187,658 | +31,033 / +9,648 (4.67 / 5.42 %) | +160 / +44 |
  | Ribbon | 646,384 / 170,896 | 676,708 / 180,379 | 676,868 / 180,419 | +30,484 / +9,523 (4.72 / 5.57 %) | +160 / +40 |
  | Writing Room | 666,428 / 176,560 | 666,832 / 177,076 | 666,832 / 177,076 | +404 / +516 (0.06 / 0.29 %) | 0 / 0 |
  | Portfolio | 670,474 / 179,731 | 671,127 / 179,895 | 671,127 / 179,895 | +653 / +164 (0.10 / 0.09 %) | 0 / 0 |

  Ruling 1 was taken on "about 9 thousand more bytes once compressed, about 5 percent more" for the four rooms; 9,523 to 9,758 compressed, 4.78 to 5.57 percent, stands inside it.
- **R2-M6. Every founding room on the mixed link** (`node out/393-pr2-r2-dry-run/393-pr2-r2-explorer-mixed.ts out/393-pr2-r2-dry-run/dist-spike spike`, log `393-pr2-r2-explorer-mixed-spike.log`; a place card opened by `.click()` on `.place-hit[data-idx="0"]`, the prospect suite's own wiring for reading a card's road, since the claim is the road's `href` and not the gesture): the Explorer draws 1858074817 with the sentence lettered, its address `#found=...&v=1&style=antique&legend=1&arms=0&beasts=0`, and its Print Room road, Reading Room road and the card's `/prospect/#found=...&v=1&style=antique&legend=1&arms=0&beasts=0&i=0` all clean; the Print Room's address, `#pr-explorer` and `#pr-portfolio` clean; the Reading Room's address `#found=...&v=1&style=antique&legend=1&arms=0&beasts=0&year=891`, clean. No console error, no 4xx. The Explorer, the Print Room and the Reading Room read clean on the head build too (`393-pr2-r2-explorer-mixed-head.log`, the same command on `dist-head`), since their writers already went through `writtenParams`; only the Prospect and the Ribbon change (WR13's readings).
- **R2-M5. The spike holds the rest** (`check-spike.log`: `npm run check` exit 0; `lint-spike.log`: eslint exit 0 over the six touched files; `npx prettier --check` over them clean; `unit-spike.log`: `npm test` 3491 of 3491).
