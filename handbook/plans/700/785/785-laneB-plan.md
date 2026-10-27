# Issue #785, row 7 (`785-laneB`): lane B's eighteen fixed pauses become waits or go

- **Planned at**: `origin/main` 36e67efeab1f29d4aa2348202d504024d6a27c9f (`git ls-remote origin refs/heads/main`, 2026-10-26). The planner's tree was made at e46fbe1b; the one commit since, PR #1077 (Issue #1074), changes no code or test file this plan edits or reads (`git diff --stat e46fbe1b origin/main -- e2e/suites/broadside.ts e2e/suites/prospect.ts e2e/suites/reading-room.ts e2e/suites/reading-room/ e2e/suites/runninghead/ e2e/support/settle.ts e2e/suites/broadside/kit.ts test/e2e/ test-support/ src/site/explorer/footnotes.ts src/site/reading-room src/site/shared/living-chart src/site/prospect src/cli/gallery.ts` prints nothing), so every check below, run over an archive of e46fbe1b, stands at 36e67efe. It does edit `handbook/specs/settle-doctrine.md`, which Specs cites, but only the sentence on re-measuring in the bullet "A cut saves wall clock only where it shortens the slowest lane", which this plan does not cite; "Who finds a slow step" and clauses 3 to 6 and 14 are unchanged (`git diff e46fbe1b origin/main -- handbook/specs/settle-doctrine.md`). Issue #785 read with 40 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate | jq length`); the newest that rules anything is 6407993113, and the one after it, 6408449263, is row 11's plan archive, not a ruling.
- **Rulings this plan builds to**: D1 to D6 (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640): D1 A, the lint lands last, so a pause that is a justified window stays a bare `sleep` here and row 12 writes it in the lint's form; D3 B, every conversion waits through `makeStable` (or `makeSettle` for a start, not a rest); D4 A, one pull request per lane. The two-reason exception to clause 5 (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6404969181) and the dispatcher's brief: no third `STILL_ONLY` reason. The re-timing duty removed (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407764430, now PR #1077 on main): nothing here touches `MEASURED_SECONDS` or starts a CI run by hand for timing. Rows 3 and 5 left the issue as Issues #1075 and #1076 (6407800857). Rows 6 to 12 run thin, with no plan skeptic, no menu and no hand-back, the implementer settling a problem in the plan itself and recording the call, the orchestrator merging on green CI (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407993113).
- **Archive path**: `handbook/plans/785/785-laneB-plan.md`.
- **Branch**: `chore/785-laneB-waits`. **Title**: `#785 Lane B's fixed pauses become waits or go (pull request 7)`.
- **Open decisions**: none.
- **Plan skeptic**: not run, as ruled in 6407993113.
- **Recon**: `vellum-spec-recon` was not dispatched, on the dispatcher's brief (recon only for cited paths and counts; recount the pauses yourself) and the thin-plan ruling; a departure from workflow step 2, named here as that step asks. The planner recounted at e46fbe1b with the 785 sort (below) and read every file, symbol and handler this plan cites.
- **No browser was run** (the dispatcher's brief: the Mac is kept quiet). Every browser reading this plan would owe is UNVERIFIABLE for that reason, and the implementer's local suite runs are the first readings (Evidence, Stop conditions).

## The recount

`node out/785-laneB-dry-run/sleep-sort.ts <tree> e46fbe1b` with `LANE_B_ONLY=1` (a one-line patch to a copy of `out/785-dry-run/sleep-sort.ts` that prints the table where it would otherwise exit on a stale hand row; log `out/785-laneB-dry-run/sleep-sort.err`, table `sleep-sort.tsv`). 405 calls in 110 files; lane B reads POLL 33, SAMPLE 5, BLIND 18, PACE 0, at exactly the 18 lines the 785 plan's appendix gives at c416da9e, none moved. The script's 12 unsorted and 27 stale hand rows are all lanes A and D (`zoom/resets.ts`, `chart-drawer/*`, `document-rooms.ts`, `survey/beat.ts`, `reading-room.ts:64, :71`, `zoom/kit.ts:57`), moved by PRs #1071 and #1073; `reading-room.ts`'s two were `atTheDesk`'s, which PR #1073 converted. Lane B's five SAMPLE (`prospect.ts:325`, `colophon.ts:145`, `prospect/gestures.ts:99`, `stage/slide-holds.ts:290`, `stage/slide-kit.ts:125`) are row 12's and untouched here.

## Specs

On top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: clause 3 (`makeStable`, an animation named by the element that carries it, a transition witnessed by its departure); clause 4 (a throwing wait stands in a step); clause 5 (a departure, an animation the action starts on a fresh element, the two `STILL_ONLY` reasons and no third, a departure read against the state its action starts from); clause 6 (the predicate never carries the claim); clause 14 (a suite leaves the browser in a known state); the environment bullets "A device-metrics override may not be undone when its clear returns" and "A sleep past an animation's nominal duration still lands mid-animation"; "When a check is pulled out of the run", the bullet "Who finds a slow step".
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code; it reads no source file) and "The browser lanes and a plate read" (the two readings a plan prints, UNVERIFIABLE here).
- `handbook/specs/conventions.md`: "How code is cited" and the comment rules.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 3, 8, 9 before the tests; Gate 2 items 6, 7, 9, 16, 17 before the waits; Gate 5 at the push.
- `handbook/plans/785/785-kits-plan.md`, "The design" (what `makeStable` is and is not for, and `atTheDesk`, whose window-and-sheet departure this plan copies).

## The design

**One rule decides each site.** A pause after an action the page handles inside the same `evaluate` that makes it (a dispatched `input` or `change`, a `requestSubmit`, a `scrollTo` with no smooth scrolling), or inside a mouse move's own dispatch (clause 5's measured fact for `carry`: the moves land before their dispatch returns), waits for nothing and is deleted. A pause after an action the page handles later (a device-metrics override, whose resize event and the room's `layout` run at the next frame; a tap, whose click the browser makes after the touch ends; an animation; a rAF sweep) becomes a wait on a witness of that later handling. A pause that is a window an absence is read over is a justified SAMPLE, stays, and is row 12's.

| site (e46fbe1b) | check | becomes | witness, or why nothing |
|---|---|---|---|
| `broadside.ts:86` | BR1c | `makeStable`, "BR1c the legend row at rest at 1280" | `document.fonts.status` is `"loaded"` and no animation runs on `.legend`: the row's `left` transitions 0.32s (`.legend` in `src/styles/shared/atelier.css`) to the seat `placeLegendRow` in `src/site/shared/room-seats.ts` writes, and `bindRoom` in `src/site/shared/room.ts` writes it again on `document.fonts.ready`; the first `placeLegendRow` call never transitions, a later one does |
| `broadside.ts:89` | BR1c | `makeStable`, "BR1c the room laid out at 1680x900" | the window at 1680x900, the sheet moved from the 1280 read, and no animation running on the row (`laidOutAt`); window and sheet together, as `atTheDesk` does, since the window flips at once and the room lays out a frame later |
| `broadside.ts:92` | BR1c | `makeStable`, "BR1c the room laid out at 1280x800" | the same, from the 1680 read |
| `broadside.ts:95` | BR1c | `makeStable`, "BR1c the room laid out again after the override" | the window off 800 high, the sheet moved from the 1280x800 read, no animation on the row; the clear may not land when it returns (the environment bullet), and BR12, BR13 and BR14 read the room after it |
| `broadside.ts:202`, `:205` | BR5 | deleted | `mouseenter` and `mouseleave` call `showPopover` and `hidePopover` synchronously (`wireFootnotes` in `src/site/explorer/footnotes.ts`), inside the mouse move's dispatch |
| `broadside.ts:218` | BR6 | `makeStable`, "BR6 the room laid out at 1024x700" | the window at 1024x700 and the sheet moved from a read taken before `setNarrowViewport`: the mark sits on the slip, which the room seats in its `resize` handler, so a tap aimed before the layout misses |
| `broadside.ts:228` | BR6 | a `makeSettle` wait "BR6 the tap's click", then the `sleep(500)` stays, reclassified SAMPLE | a click counter the check adds on the window (it runs after the mark's own handler) must rise: the tap's click arrives after `touchEnd`. The 500 ms after it is the window a wrongful anchor navigation would commit in (the comment above `tapAt`: a dropped `preventDefault` survived a same-evaluate read), an absence, so a justified SAMPLE for row 12 |
| `prospect.ts:330` | PB7d | deleted | the emptied submit's handler (`yearForm`'s `submit` listener in `src/site/prospect/app.ts`) restores the field synchronously: `parseYear("")` is `null` |
| `reading-room/colophon.ts:95` | RR18 | deleted | Pause (`pause`), the bar's `input` (`onBarInput`, then `paintPos`, which inks the annals and sets the position) and `change` (`syncHash`, a `history.replaceState`) all run inside the one `evaluate` (`src/site/shared/living-chart/ages.ts`, `src/site/reading-room/app.ts`) |
| `reading-room/colophon.ts:185` | RR22 | `makeSettle`, "RR22 the sweep under way" | the ages position `u` (`window.__vellumReadingRoomAges()`) moved from where it stood before Play: Play from the park restarts the sweep at the survey's start (`playStart` in `src/render/ages-track.ts`) and paints from the first rAF tick. A start, not a rest (the sweep never stops), so `makeSettle`, not `makeStable`, as `785-kits-plan.md` says for a poll for an action's start |
| `reading-room/desk.ts:11` | RR31 | deleted | `scrollTo` is instant (no `scroll-behavior: smooth` under `src/styles/`), and a chart room has no page scroll for it to move |
| `reading-room/desk.ts:25`, `:30` | RR35 | deleted | the bar's `input` writes the told row synchronously (`onBarInput`, `paintPos`, `onAgesTold`, `setTold` in `src/site/shared/reading-frame/index.ts`), and `offsetHeight` lays the strip out on read |
| `reading-room/desk.ts:55` | RR37 | deleted | the same |
| `reading-room/desk.ts:59` | RR37 | `makeStable`, "RR37 the strip at <w>", three times | the window at that width; the strip is laid out by CSS alone (`.strip` in `src/styles/reading-room/index.css`, the desk layer in `src/styles/shared/shell.css`), so the window is the one thing a read can be early for |
| `reading-room/desk.ts:64` | RR37 (and RR39, RR43, RR41 after it) | `makeStable`, "RR37 the room laid out again at 1440x900" | the window at 1440x900 and the sheet moved from the 768 read: `atTheDesk`'s own departure, with its `DESK`, `atDesk` and `sameSheet` moved to `reads.ts` so `desk.ts` can use them without an import cycle |
| `runninghead/gallery.ts:23` | RH10 | `makeStable`, "RH10 the Gallery's plates landed", `animated: ".grid"` | the grid's `sheet-land` (`GALLERY_PAGE_CSS` in `src/cli/gallery.ts`, `animation: sheet-land 0.55s ... both`), on a fresh document (`visit` after `about:blank`), so `animated` alone is clause 5's form; the poll before it can break while the plates are still fading in. It is the page's only `.grid` (`git grep -n -E 'class="[^"]*\bgrid\b' -- src` names `src/pages/gallery/index.astro:24` alone) |

So 8 sites are deleted, 9 become waits, and 1 gains a wait before a window that stays. No `STILL_ONLY` reason is added or reused.

**What the conversions drag with them.**
- **Steps.** `br6Tap` and `rr22MidPlay` now throw, so `vellum/e2e-throw-inside-step` requires them in steps (measured: with the planned files and either call left bare, the lint names `br6Tap` at `e2e/suites/broadside.ts:78` and `rr22MidPlay` at `e2e/suites/reading-room.ts:51`). They become `step("BR6", ...)` and `step("RR22", ...)`. The comment at `e2e/suites/broadside.ts:15` ("BR3 through BR6 and BR8 are deliberately not stepped") becomes "BR3, BR4, BR5 and BR8". BR1c, RR31 to RR37 and RH10 already stand in steps; BR5, PB7d and RR18 lose a pause and throw nothing new.
- **Clause 14.** BR1c clears its override in a `finally`; BR6 calls `clearMobile` in a `.finally`; RR37 sends the 1440x900 override in a `.finally`, so a wait that gives up mid-check never leaves the next checks on a resized window.
- **Exports for the tests.** `br1cLegendClears`, `br5Hover`, `br6Tap` and the payloads `LEGEND_ROOM`, `NARROW`, `CLICKS`, `TAPPED`, `MARK` (broadside), `SWEEP` (colophon), `WIDE` (desk), `SCROLLED` (gallery) are exported so the unit tests can drive them and answer them by identity; `DESK`, `atDesk`, `sameSheet` and type `Desk` move from `e2e/suites/reading-room.ts` to `e2e/suites/reading-room/reads.ts`, exported, and `reading-room.ts` imports them.
- **No check's claim changes.** Every `check(` keeps its name, its expression and its detail; BR1c's payload gains `fonts` and `moving`, which only the waits read and the detail prints.

**Rejected:**
- A resize counter installed on the page (PR #1071's `COUNT_RESIZES` in `e2e/suites/zoom/resets.ts`) for BR1c and BR6: `atTheDesk`'s window-and-sheet pair is the lane's own merged precedent, needs no install, and avoids importing from lane A's file while lane A's pull request edits it.
- `animated: ".legend"` for BR1c: `.legend` keeps a finished `ink-in` (fill `both`), so the list reads finished from the start, and the row's motion is a transition, which leaves the list when it ends (clause 3). The read carries "any animation running on the row" instead, which a running transition and a running `ink-in` both are.
- The row's computed `left` against its inline `left` as BR1c's rest witness: the two serialize at different precision, so an exact compare can stay false at rest, and a tolerance would be a new bound with nothing measured behind it.
- For BR6's tail, reading `defaultPrevented` on the click and deleting the 500 ms window: it would add a clause to BR6's claim, the mechanism beside the outcome; least change keeps the claim and its window, and only gives the click's arrival a witness.
- A hover counter or `:hover` witness for BR5: the move's own dispatch lands the hover (clause 5's `carry` fact), and a throwing wait would put BR5 in a step for nothing.
- For RR22, deleting the pause: the sleep placed the Read mid-sweep, and the 785 plan's rule for a pause that places an interrupt mid-flight (`turn.ts:104` and the like) is a poll for the state it places it in.
- For RR37's widths, deleting the pauses: a set override reads its size at once in every trace taken so far (PR #1071's Z13 trace, PR #1073's `atTheDesk` trace), but no CI reading exists, and the window is a witness at about 50 ms a width.
- An `img.decode()` witness for RH10: a promise read, which `makeStable` refuses and the harness's `evaluate` would hang on with no budget; today's 300 ms never witnessed the decode either, and a blank plate reds RH10's own `plateLum` by name (call 9).
- Unit tests for PB7d's deletion: `pb7YearFilter` is not exported, and exporting it wraps its signature past the lint's 50-line function limit (measured: 54 lines). The deletion's proof is the synchronous handler cited above and PB7d's own browser check (call 8).
- Extending `test/e2e/kit-waits.test.ts`'s `deskRun` fake to RR37's widths: that fake already stops inside the desk step at RR35's range read (its fake page has no `.rf-range`, so the read throws in the step), before RR37, and it stays green unchanged (measured below); RR37 gets its own tests in a new file.

## Files

Every path relative to the repo root. Built and checked in a scratch archive of e46fbe1b with the planned files laid over it (`node out/785-laneB-dry-run/stage.ts <tree>` rebuilds it at `out/785-laneB-dry-run/copy/`; delete the copy after use, since `node --test` collects any file under a directory named `test`): `tsc --noEmit` for `tsconfig.json`, `tsconfig.engine.json` and `tsconfig.worker.json` exit 0 (`tsc.log`); `eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 e2e test test-support` exit 0 (`lint.log`); `prettier --check e2e test/e2e test-support` clean (`format.log`); `node --import ./test-support/source-read-guard.ts --test test/e2e/*.test.ts test/repo/e2e-*.test.ts` 422 of 422 (`tests-planned.log`), which includes `test/repo/e2e-read-types.test.ts` (every kept read states its shape), `test/repo/e2e-steps.test.ts`, `test/e2e/kit-waits.test.ts` and `test/e2e/stable.test.ts`. None of that is `npm run check`, `npm run lint`, `npm run format:check` or `npm test` over a real checkout: those are the implementer's. The finished files stand whole at `out/785-laneB-dry-run/planned/` (the tests named `*.planned.ts`), copied to the main checkout's `out/785-laneB-dry-run/` when the dispatcher retires the planner's tree. Run `npm run format` after typing them.

Edited (lines after): `e2e/suites/broadside.ts` (283 to 328), `e2e/suites/prospect.ts` (403 to 402), `e2e/suites/reading-room.ts` (86 to 83), `e2e/suites/reading-room/colophon.ts` (224 to 228), `e2e/suites/reading-room/desk.ts` (99 to 112), `e2e/suites/reading-room/reads.ts` (43 to 48), `e2e/suites/runninghead/gallery.ts` (305 to 310).

New: `test-support/recording-suite.ts` (68 lines: `recordingSuite`, `emulations`, `lastSent`, `timeline`, types `Sent`, `Checked`, `Phase`, `Stage`), `test/e2e/broadside-waits.test.ts` (182), `test/e2e/reading-room-waits.test.ts` (159), `test/e2e/gallery-waits.test.ts` (46). Three test files and one helper rather than one file, because one file read 414 lines and the lint's `max-lines` is 400 (measured).

New or changed signatures:
- `e2e/suites/broadside.ts`: `export const LEGEND_ROOM: Payload<Room>`, `export const NARROW: Payload<Narrow>`, `export const CLICKS: Payload<{ n: number }>`, `export const TAPPED: Payload<Tapped>`, `export const MARK: Payload<Point | null>`; module-private `legendClear(m: Room): boolean` (moved out of `br1cLegendClears`), `sameBox(a: Box, b: Box): boolean`, `laidOutAt(w: number, h: number, from: Room): (d: Room) => boolean`, `COUNT_CLICKS`, `tapAt(k: BroadsideKit, settle: Settle): Promise<boolean>`, `narrowTaps(k: BroadsideKit, before: Narrow)`; `export async function br1cLegendClears(k: BroadsideKit): Promise<void>`, `export async function br5Hover(k: BroadsideKit): Promise<void>`, `export async function br6Tap(k: BroadsideKit): Promise<void>`. Type `Room` gains `fonts: string; moving: boolean`.
- `e2e/suites/reading-room/reads.ts`: `export type Desk`, `export const DESK: Payload<Desk>`, `export const atDesk(d: Desk): boolean`, `export const sameSheet(a: Desk, b: Desk): boolean`, moved unchanged from `reading-room.ts`.
- `e2e/suites/reading-room/colophon.ts`: `export const SWEEP: Payload<{ u: number | null }>`.
- `e2e/suites/reading-room/desk.ts`: `export const WIDE: Payload<Wide>` (`DESK` and the strip read in one payload), module-private `ENVELOPE_WIDTHS`, `AT_DESK`.
- `e2e/suites/runninghead/gallery.ts`: `export const SCROLLED: Payload<{ y: number }>`.

The finished diff of the seven edited files, exactly (`out/785-laneB-dry-run/planned.diff`):

```diff
--- a/e2e/suites/broadside.ts
+++ b/e2e/suites/broadside.ts
@@ -1,6 +1,7 @@
 // Broadside e2e (BR1-BR14, Issue #270): the regrouped controls, seals, journal button and footnote apparatus on the built running page, and since Issue #779 part 2h the Explorer as authored and as dressed (BR9 to BR14), self-contained with scoped deltas.
 import { dropExpectedCancellations } from "../support/console.ts";
 import type { Payload, Point, SuiteContext } from "../types.ts";
+import { makeSettle, makeStable, type Settle } from "../support/settle.ts";
 import { makeStep } from "../support/step.ts";
 import { br9Authored, br10Terms, br11Allowlist } from "./broadside/room.ts";
 import { br12Dress } from "./broadside/dress.ts";
@@ -8,11 +9,55 @@
 import { broadsideKit, type BroadsideKit } from "./broadside/kit.ts";
 
 type Box = { l: number; r: number; t: number; b: number; w: number } | null;
-type Room = { lg: Box; bl: Box; sl: Box; gl: Box; sh: Box; folioText: number; w: number; h: number };
+type Room = {
+  lg: Box;
+  bl: Box;
+  sl: Box;
+  gl: Box;
+  sh: Box;
+  folioText: number;
+  w: number;
+  h: number;
+  fonts: string;
+  moving: boolean;
+};
 
+// The row's left transitions 0.32s to the seat the room writes, and the room writes it again on `document.fonts.ready` and on every resize, so a read waits for the fonts and for no animation running on the row.
+export const LEGEND_ROOM: Payload<Room> = `(()=>{const r=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();return{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)};};
+      const lg=r(".legend"),bl=r(".corner.bl"),sl=r("#broadside"),gl=r(".corner.br"),sh=r("#sheet");
+      const range=document.createRange();let text=0;for(const p of document.querySelectorAll(".corner.bl p")){if(!p.textContent)continue;range.selectNodeContents(p);text=Math.max(text,range.getBoundingClientRect().right);}
+      const row=document.querySelector(".legend");const moving=!!row&&row.getAnimations().some((a)=>a.playState==="running");
+      return{lg,bl,sl,gl,sh,folioText:Math.round(text),w:innerWidth,h:innerHeight,fonts:document.fonts.status,moving};})()`;
+const legendClear = (m: Room): boolean =>
+  !!m.lg &&
+  m.lg.l >= m.folioText + 16 &&
+  m.lg.r <= m.sl!.l - 8 &&
+  m.lg.r <= m.gl!.l - 8 &&
+  m.sh!.r <= m.gl!.l - 8 &&
+  m.sh!.b <= Math.min(m.bl!.t, m.lg.t) - 8;
+const sameBox = (a: Box, b: Box): boolean => JSON.stringify(a) === JSON.stringify(b);
+const laidOutAt =
+  (w: number, h: number, from: Room) =>
+  (d: Room): boolean =>
+    d.w === w && d.h === h && !sameBox(d.sh, from.sh) && !d.moving;
+
+type Narrow = { iw: number; ih: number; sheet: Box };
+export const NARROW: Payload<Narrow> = `(()=>{const e=document.getElementById("sheet");const b=e?e.getBoundingClientRect():null;return{iw:innerWidth,ih:innerHeight,sheet:b&&{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)}};})()`;
+// Counted on the window, after the mark's own handler has run, so a count that rose means the page has handled the tap's click.
+const COUNT_CLICKS = `(()=>{if(window.__br6Clicks===undefined){window.__br6Clicks=0;addEventListener("click",()=>{window.__br6Clicks++;});}return true;})()`;
+export const CLICKS: Payload<{ n: number }> = `({ n: window.__br6Clicks })`;
+type Tapped = { stayed: boolean; open: boolean; hasLink: boolean };
+export const TAPPED: Payload<Tapped> = `(()=>{const n=document.getElementById("note-survey");
+    return{stayed:location.pathname==="/explorer/",open:!!n&&n.matches(":popover-open"),
+      hasLink:!!document.querySelector('#note-survey a[href="/glossary/#survey"]')};})()`;
+export const MARK: Payload<Point | null> = `(()=>{const m=document.querySelector('a.fn[data-note="note-survey"]');
+      if(!m)return null;
+      m.scrollIntoView({block:"center"});const r=m.getBoundingClientRect();
+      return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`;
+
 export async function run(ctx: SuiteContext): Promise<void> {
   const { consoleErrors, http4xx } = ctx;
-  // BR3 through BR6 and BR8 are deliberately not stepped: the reads and gestures in them return rather than throwing, and their checks already guard on it.
+  // BR3, BR4, BR5 and BR8 are deliberately not stepped: the reads and gestures in them return rather than throwing, and their checks already guard on it.
   const step = makeStep(ctx);
   const k = broadsideKit(ctx);
   const errBase = consoleErrors.length;
@@ -30,7 +75,7 @@
   await br5Hover(k);
   await step("BR13", () => br13Tip(k));
   await step("BR14", () => br14Paper(k));
-  await br6Tap(k);
+  await step("BR6", () => br6Tap(k));
   await step("BR7", () => br7Glossary(k));
   await step("BR10", () => br10Terms(k));
   await step("BR9", () => br9Authored(k));
@@ -71,28 +116,26 @@
   );
 }
 
-async function br1cLegendClears({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
-  const legendRoom: Payload<Room> = `(()=>{const r=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();return{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)};};
-      const lg=r(".legend"),bl=r(".corner.bl"),sl=r("#broadside"),gl=r(".corner.br"),sh=r("#sheet");
-      const range=document.createRange();let text=0;for(const p of document.querySelectorAll(".corner.bl p")){if(!p.textContent)continue;range.selectNodeContents(p);text=Math.max(text,range.getBoundingClientRect().right);}
-      return{lg,bl,sl,gl,sh,folioText:Math.round(text),w:innerWidth,h:innerHeight};})()`;
-  const legendClear = (m: Room): boolean =>
-    !!m.lg &&
-    m.lg.l >= m.folioText + 16 &&
-    m.lg.r <= m.sl!.l - 8 &&
-    m.lg.r <= m.gl!.l - 8 &&
-    m.sh!.r <= m.gl!.l - 8 &&
-    m.sh!.b <= Math.min(m.bl!.t, m.lg.t) - 8;
-  await sleep(400); // the row's left transitions 0.32s to its measured seat; a read mid-flight is the old seat
-  const at1280 = await evaluate(legendRoom);
+export async function br1cLegendClears({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
+  const stable = makeStable(makeSettle({ evaluate, sleep }));
+  const at1280 = await stable(LEGEND_ROOM, "BR1c the legend row at rest at 1280", {
+    departed: (d) => d.fonts === "loaded" && !d.moving,
+  });
   await send("Emulation.setDeviceMetricsOverride", { width: 1680, height: 900, deviceScaleFactor: 1, mobile: false });
-  await sleep(600);
-  const at1680 = await evaluate(legendRoom);
-  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
-  await sleep(600);
-  const back = await evaluate(legendRoom);
-  await send("Emulation.clearDeviceMetricsOverride");
-  await sleep(600);
+  let at1680: Room;
+  let back: Room;
+  try {
+    at1680 = await stable(LEGEND_ROOM, "BR1c the room laid out at 1680x900", {
+      departed: laidOutAt(1680, 900, at1280),
+    });
+    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
+    back = await stable(LEGEND_ROOM, "BR1c the room laid out at 1280x800", { departed: laidOutAt(1280, 800, at1680) });
+  } finally {
+    await send("Emulation.clearDeviceMetricsOverride");
+  }
+  await stable(LEGEND_ROOM, "BR1c the room laid out again after the override", {
+    departed: (d) => d.h !== 800 && !sameBox(d.sh, back.sh) && !d.moving,
+  });
   check(
     "BR1c the legend row and the sheet clear the chart folio, the Glass and the open slip at 1280, at 1680 after a resize, and back again (#463)",
     legendClear(at1280) && legendClear(at1680) && legendClear(back),
@@ -195,14 +238,12 @@
   );
 }
 
-async function br5Hover({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
+export async function br5Hover({ evaluate, send, check }: BroadsideKit): Promise<void> {
   const rect = await evaluate<Point>(`(()=>{const m=document.querySelector('a.fn[data-note="note-coast-warp"]');
     const r=m.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
   await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
-  await sleep(80);
   const overOpen = await evaluate<boolean>(`document.getElementById("note-coast-warp").matches(":popover-open")`);
   await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 4, y: 4 });
-  await sleep(80);
   const awayClosed = await evaluate<boolean>(`!document.getElementById("note-coast-warp").matches(":popover-open")`);
   check(
     "BR5 the note shows under a real hover and hides when the pointer leaves",
@@ -211,36 +252,40 @@
   );
 }
 
-async function br6Tap({ evaluate, check, sleep, touch, setNarrowViewport, clearMobile }: BroadsideKit): Promise<void> {
+// The post-tap sleep lets a pending anchor navigation COMMIT before a fresh evaluate reads the path: a same-evaluate read cannot see it (the guard-prover proved a dropped preventDefault survived that shape).
+async function tapAt({ evaluate, sleep, touch }: BroadsideKit, settle: Settle): Promise<boolean> {
+  const p = await evaluate(MARK);
+  if (!p) return false;
+  const { n } = await evaluate(CLICKS);
+  await touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
+  await touch("touchEnd", []);
+  await settle(CLICKS, (d) => d.n > n, "BR6 the tap's click");
+  await sleep(500); // past any pending navigation's commit
+  return true;
+}
+
+async function narrowTaps(k: BroadsideKit, before: Narrow) {
+  const { evaluate, sleep } = k;
+  const settle = makeSettle({ evaluate, sleep });
+  const emulated = await evaluate<boolean>(`window.matchMedia("(hover: none)").matches`);
+  await makeStable(settle)(NARROW, "BR6 the room laid out at 1024x700", {
+    departed: (d) => d.iw === 1024 && d.ih === 700 && !sameBox(d.sheet, before.sheet),
+  });
+  await evaluate(COUNT_CLICKS);
+  const tapped1 = await tapAt(k, settle);
+  const afterTap1 = await evaluate(TAPPED);
+  const tapped2 = await tapAt(k, settle);
+  const afterTap2 = await evaluate(TAPPED);
+  return { emulated, tapped1, tapped2, afterTap1, afterTap2 };
+}
+
+export async function br6Tap(k: BroadsideKit): Promise<void> {
+  const { evaluate, check, setNarrowViewport, clearMobile } = k;
   // REAL CDP taps fire the full compat sequence a synthetic .click() skips (which once hid an off-by-one here); device metrics + touch emulation is what actually flips the hover/pointer media in this browser, setEmulatedMedia's feature overrides are a no-op.
+  const before = await evaluate(NARROW);
   await setNarrowViewport(1024, 700);
-  const emulated = await evaluate<boolean>(`window.matchMedia("(hover: none)").matches`);
-  await sleep(120);
-  // The post-tap sleep lets a pending anchor navigation COMMIT before a fresh evaluate reads the path: a same-evaluate read cannot see it (the guard-prover proved a dropped preventDefault survived that shape).
-  const tapAt = async (): Promise<boolean> => {
-    const p = await evaluate<Point | null>(`(()=>{const m=document.querySelector('a.fn[data-note="note-survey"]');
-      if(!m)return null;
-      m.scrollIntoView({block:"center"});const r=m.getBoundingClientRect();
-      return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
-    if (!p) return false;
-    await touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
-    await touch("touchEnd", []);
-    await sleep(500); // past the tap-dismiss window, and past any pending navigation's commit
-    return true;
-  };
-  const probe = () =>
-    evaluate<{
-      stayed: boolean;
-      open: boolean;
-      hasLink: boolean;
-    }>(`(()=>{const n=document.getElementById("note-survey");
-    return{stayed:location.pathname==="/explorer/",open:!!n&&n.matches(":popover-open"),
-      hasLink:!!document.querySelector('#note-survey a[href="/glossary/#survey"]')};})()`);
-  const tapped1 = await tapAt();
-  const afterTap1 = await probe();
-  const tapped2 = await tapAt();
-  const afterTap2 = await probe();
-  await clearMobile();
+  const taps = await narrowTaps(k, before).finally(() => clearMobile());
+  const { emulated, tapped1, tapped2, afterTap1, afterTap2 } = taps;
   check(
     "BR6 under hover:none, on a 1024 tablet since the narrow layout went (Issue #762), a real tap opens the note without navigating and a second tap closes it",
     emulated &&
@@ -251,7 +296,7 @@
       afterTap1.hasLink &&
       !afterTap2.open &&
       afterTap2.stayed,
-    JSON.stringify({ emulated, tapped1, tapped2, afterTap1, afterTap2 }),
+    JSON.stringify(taps),
   );
 }
 
--- a/e2e/suites/prospect.ts
+++ b/e2e/suites/prospect.ts
@@ -327,7 +327,6 @@
   await evaluate(
     `(()=>{document.getElementById("pp-year").value="";document.getElementById("pp-year-form").requestSubmit();})()`,
   );
-  await sleep(300);
   const emptied = await state();
   check(
     "PB7d a year that is not a year is refused: garbage fails the control's pattern and nothing is re-engraved; an emptied field returns to the plate's year",
--- a/e2e/suites/reading-room.ts
+++ b/e2e/suites/reading-room.ts
@@ -1,8 +1,9 @@
 // Reading Room e2e (RR0-RR43; Issue #221 plus Issue #318 colophon dice, Issue #418 pre-arm window, Issue #402 prospect stage and Issue #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on Issue #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
 import { makeSettle, makeStable } from "../support/settle.ts";
 import { makeStep } from "../support/step.ts";
-import type { Payload, SuiteContext } from "../types.ts";
+import type { SuiteContext } from "../types.ts";
 import { readingRoomKit, type ReadingRoomKit } from "./reading-room/kit.ts";
+import { DESK, atDesk, sameSheet } from "./reading-room/reads.ts";
 import { rr0Boots, rr4AtRest, rr26BareVisit, rr29Play } from "./reading-room/arrival.ts";
 import { rrDeskReads } from "./reading-room/desk.ts";
 import { rr6Survey, rr7Year, rr9Today, rr10CrossLinks } from "./reading-room/addresses.ts";
@@ -22,10 +23,6 @@
 import { rr40Glass, rr41ReadRefits, rr42PlateReveal } from "./reading-room/gestures.ts";
 
 type Step = ReturnType<typeof makeStep>;
-type Desk = { iw: number; ih: number; sheet: number[] | null };
-const DESK: Payload<Desk> = `(() => { const e = document.getElementById("sheet"); const b = e ? e.getBoundingClientRect() : null; return { iw: innerWidth, ih: innerHeight, sheet: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
-const atDesk = (d: Desk): boolean => d.iw === 1440 && d.ih === 900;
-const sameSheet = (a: Desk, b: Desk): boolean => JSON.stringify(a.sheet) === JSON.stringify(b.sheet);
 
 export async function run(ctx: SuiteContext): Promise<void> {
   const { send, shoot, consoleErrors, http4xx, PORT } = ctx;
@@ -51,7 +48,7 @@
   await rr18Park(ctx);
   await rr20Superseded(ctx);
   await rr21Dice(ctx);
-  await rr22MidPlay(ctx);
+  await step("RR22", () => rr22MidPlay(ctx));
   await rr23Usurped(k);
   await rr24BeforeArm(k);
   await rr25TearDown(k);
--- a/e2e/suites/reading-room/colophon.ts
+++ b/e2e/suites/reading-room/colophon.ts
@@ -1,7 +1,11 @@
-import type { SuiteContext } from "../../types.ts";
+import { makeSettle } from "../../support/settle.ts";
+import type { Payload, SuiteContext } from "../../types.ts";
 import type { ReadingRoomKit } from "./kit.ts";
 import type { Ages } from "./reads.ts";
 
+export const SWEEP: Payload<{ u: number | null }> =
+  `(()=>{const a=window.__vellumReadingRoomAges();return{u:a?a.u:null};})()`;
+
 export async function rr16Colophon({ evaluate, check }: SuiteContext): Promise<void> {
   const colo = await evaluate<{
     input: boolean;
@@ -87,12 +91,11 @@
   );
 }
 
-export async function rr18Park({ evaluate, check, sleep }: SuiteContext): Promise<void> {
+export async function rr18Park({ evaluate, check }: SuiteContext): Promise<void> {
   // Back to the present park so RR18/RR19 below read the rest this draw actually landed at.
   await evaluate(
     `(()=>{const p=document.querySelector(".rf-play");if(p.textContent==="Pause")p.click();const r=document.querySelector(".rf-range");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));return null;})()`,
   );
-  await sleep(150);
 
   const after = await evaluate<{
     ages: Ages | null;
@@ -181,8 +184,9 @@
 }
 
 export async function rr22MidPlay({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
+  const from = await evaluate(SWEEP);
   await evaluate(`(()=>{document.querySelector(".rf-play").click();})()`);
-  await sleep(350);
+  await makeSettle({ evaluate, sleep })(SWEEP, (d) => d.u !== null && d.u !== from.u, "RR22 the sweep under way");
   const midPlay = await evaluate<{ label: string }>(
     `(()=>{const p=document.querySelector(".rf-play");return{label:p.textContent};})()`,
   );
--- a/e2e/suites/reading-room/desk.ts
+++ b/e2e/suites/reading-room/desk.ts
@@ -1,14 +1,19 @@
+import { makeSettle, makeStable } from "../../support/settle.ts";
 import type { Payload, SuiteContext } from "../../types.ts";
-import { GOVERNING_BUDGET, stripRead, WIDE_WORST } from "./reads.ts";
-import type { Room, Strip } from "./reads.ts";
+import { atDesk, DESK, GOVERNING_BUDGET, sameSheet, stripRead, WIDE_WORST } from "./reads.ts";
+import type { Desk, Room, Strip } from "./reads.ts";
 
+type Wide = Desk & { strip: Strip | null };
+export const WIDE: Payload<Wide> = `(() => ({ ...(${DESK}), strip: (${stripRead}) }))()`;
+const ENVELOPE_WIDTHS = [1024, 900, 768] as const;
+const AT_DESK = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false } as const;
+
 export async function rr31StripStands(
-  { evaluate, check, sleep }: SuiteContext,
+  { evaluate, check }: SuiteContext,
   deskRest: Strip | null,
   room: Room,
 ): Promise<void> {
   await evaluate(`(()=>{window.scrollTo(0,document.documentElement.scrollHeight);return null;})()`);
-  await sleep(200);
   const afterScroll = await evaluate(stripRead);
   check(
     "RR31 at 1440x900 the strip stands on the viewport's bottom edge and a chart room has no page scroll to leave it by (#463, ruling 6)",
@@ -17,17 +22,15 @@
   );
 }
 
-export async function rr35GoverningBudget({ evaluate, check, sleep }: SuiteContext, deskRest: Strip | null) {
+export async function rr35GoverningBudget({ evaluate, check }: SuiteContext, deskRest: Strip | null) {
   // BOTH halves at the governing width: deskRest alone is the chronicle half's short last annal, which reads 100 at every width and cannot exceed the budget; the survey half carries the long prose and can.
   await evaluate(
     `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
   );
-  await sleep(150);
   const deskSurvey = await evaluate(stripRead);
   await evaluate(
     `(()=>{const r=document.querySelector(".rf-range");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
   );
-  await sleep(150);
   const deskChron = await evaluate(stripRead);
   check(
     `RR35 at the governing 1440x900 the strip costs no more than ${GOVERNING_BUDGET}px, in EITHER half (#442, re-pinned for the bottom strip at #463)`,
@@ -52,16 +55,26 @@
   await evaluate(
     `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
   );
-  await sleep(120);
-  const byWidth: { w: number; h: number | null; told: string | null; gutter: string | undefined | null }[] = [];
-  for (const w of [1024, 900, 768]) {
-    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
-    await sleep(250);
-    const s = await evaluate(stripRead);
-    byWidth.push({ w, h: s && s.h, told: s && s.toldDisplay, gutter: s && s.gutter });
-  }
-  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
-  await sleep(200);
+  const stable = makeStable(makeSettle({ evaluate, sleep }));
+  const across = async (): Promise<Wide[]> => {
+    const reads: Wide[] = [];
+    for (const w of ENVELOPE_WIDTHS) {
+      await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
+      reads.push(await stable(WIDE, `RR37 the strip at ${w}`, { departed: (d) => d.iw === w }));
+    }
+    return reads;
+  };
+  const reads = await across().finally(() => send("Emulation.setDeviceMetricsOverride", AT_DESK));
+  const narrowest = reads[reads.length - 1]!;
+  await stable(DESK, "RR37 the room laid out again at 1440x900", {
+    departed: (d) => atDesk(d) && !sameSheet(d, narrowest),
+  });
+  const byWidth = reads.map(({ iw, strip: s }) => ({
+    w: iw,
+    h: s && s.h,
+    told: s && s.toldDisplay,
+    gutter: s && s.gutter,
+  }));
   check(
     `RR37 and it stays within the ${WIDE_WORST}px envelope across the widths: the told row stands at 1024, and at 900 and 768 the strip is the 1024 page's, the told row standing and the height the same (#462 ruling 6; the 1024 floor, Alex, 2026-10-06, Issue #762)`,
     byWidth.length === 3 &&
--- a/e2e/suites/reading-room/reads.ts
+++ b/e2e/suites/reading-room/reads.ts
@@ -33,6 +33,11 @@
   bottomClear: number;
 };
 
+export type Desk = { iw: number; ih: number; sheet: number[] | null };
+export const DESK: Payload<Desk> = `(() => { const e = document.getElementById("sheet"); const b = e ? e.getBoundingClientRect() : null; return { iw: innerWidth, ih: innerHeight, sheet: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
+export const atDesk = (d: Desk): boolean => d.iw === 1440 && d.ih === 900;
+export const sameSheet = (a: Desk, b: Desk): boolean => JSON.stringify(a.sheet) === JSON.stringify(b.sheet);
+
 export const agesRead: Payload<AgesRead> = `(()=>{const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const panel=document.querySelector(".rf-ages");return{ages:a,play:p?p.textContent:null,panelHidden:panel?panel.hidden:null,hash:location.hash};})()`;
 // Issue #402 the prospect stage: href read raw (getAttribute), src as the browser's absolute blob URL. Placement ruled 2026-08-22: inside the panel, below the sticky strip (Issue #442 wrapped the bar in one), above the journal.
 export const stageRead: Payload<Stage | null> = `(()=>{const f=document.querySelector(".rr-prospect");if(!f)return null;const img=f.querySelector("img");const a=f.querySelector("a");const panel=document.querySelector(".rf-ages");const prev=f.previousElementSibling;const next=f.nextElementSibling;return{hidden:f.hidden,src:img?String(img.src||""):null,alt:img?img.alt:null,href:a?a.getAttribute("href"):null,inSlip:!!f.closest("#journal .journal-dock"),aboveLog:!!(next&&next.classList.contains("rf-log")),belowBar:!!(panel&&panel.contains(f)&&prev&&prev.classList.contains("rf-instrument-strip")&&next&&next.classList.contains("rf-log"))};})()`;
--- a/e2e/suites/runninghead/gallery.ts
+++ b/e2e/suites/runninghead/gallery.ts
@@ -1,9 +1,11 @@
 import { GALLERY_COUNT, GALLERY_SEED } from "../../../src/cli/gallery.ts";
 import { GRADIENT_STOPS, luminance, nearRgba, PAGE_RGBA, SHADE, sampleRow, tokenRgba } from "../../support/pixel.ts";
-import { makeSettle } from "../../support/settle.ts";
+import { makeSettle, makeStable } from "../../support/settle.ts";
 import type { Payload, Point } from "../../types.ts";
 import type { RunningHeadKit } from "./kit.ts";
 
+export const SCROLLED: Payload<{ y: number }> = `({ y: scrollY })`;
+
 export async function rh10GalleryScrolled({ evaluate, send, check, sleep, visit }: RunningHeadKit): Promise<void> {
   // The harness window is tall, so this check pins its own viewport; the Gallery is the one chart room that scrolls.
   await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
@@ -20,7 +22,10 @@
     if (scrolled.plate && scrolled.loaded) break;
     await sleep(100);
   }
-  await sleep(300);
+  if (scrolled)
+    await makeStable(makeSettle({ evaluate, sleep }))(SCROLLED, "RH10 the Gallery's plates landed", {
+      animated: ".grid",
+    });
   const plateRow = scrolled && scrolled.plate ? await sampleRow(send, scrolled.plate.x, scrolled.plate.y, 8) : [];
   const cornerRow = scrolled ? await sampleRow(send, 8, 8, 8) : [];
   const plateLum = plateRow.length ? Math.round(Math.max(...plateRow.map(luminance))) : -1;
```

The new files, exactly (each is its finished text; `npm run format` leaves it as it stands).

**`test-support/recording-suite.ts`**

```ts
import type { SuiteContext } from "../e2e/types.ts";

export type Sent = { method: string; params?: Record<string, unknown> };
export type Checked = { code: string; ok: boolean };

export const recordingSuite = (answer: (expression: string, sent: readonly Sent[]) => unknown) => {
  const said: string[] = [];
  const sent: Sent[] = [];
  const slept: number[] = [];
  const checked: Checked[] = [];
  const record = (method: string, params?: Record<string, unknown>): Promise<unknown> => {
    sent.push({ method, params });
    return Promise.resolve({});
  };
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      said.push(expression);
      return Promise.resolve(answer(expression, sent));
    },
    send: record,
    sleep: (ms: number): Promise<void> => {
      slept.push(ms);
      return Promise.resolve();
    },
    check: (name: string, ok: unknown): void => void checked.push({ code: name.split(" ")[0]!, ok: !!ok }),
    shoot: (): Promise<void> => Promise.resolve(),
    touch: (type: string, points: unknown): Promise<unknown> => record(`touch ${type}`, { points }),
    setNarrowViewport: async (width: number, height: number): Promise<void> => {
      await record("Emulation.setDeviceMetricsOverride", { width, height });
    },
    clearMobile: async (): Promise<void> => {
      await record("Emulation.clearDeviceMetricsOverride");
    },
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, said, sent, slept, checked };
};
export const emulations = (sent: readonly Sent[]): number =>
  sent.filter((s) => s.method.startsWith("Emulation.")).length;
export const lastSent = (sent: readonly Sent[]): Sent | undefined => sent.at(-1);

// The page lays out only as far as it is watched: each read of the room after an emulation moves it one phase on, so a wait that stops reading early acts on a room still in flight.
export type Phase<R> = readonly [reads: number, room: R];
export type Stage<R> = { readonly phases: readonly Phase<R>[]; readonly rest: R };
export const timeline = <R>(stages: readonly Stage<R>[]) => {
  let stage = -1;
  let reads = 0;
  let last: R | null = null;
  const next = (at: number): R => {
    if (at !== stage) {
      stage = at;
      reads = 0;
    }
    reads++;
    const { phases, rest } = stages[Math.min(stage, stages.length - 1)]!;
    let upTo = 0;
    last = rest;
    for (const [n, r] of phases) {
      upTo += n;
      if (reads <= upTo) {
        last = r;
        break;
      }
    }
    return last;
  };
  return { next, last: () => last };
};
```

**`test/e2e/broadside-waits.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  br1cLegendClears,
  br5Hover,
  br6Tap,
  CLICKS,
  LEGEND_ROOM,
  MARK,
  NARROW,
  TAPPED,
} from "../../e2e/suites/broadside.ts";
import type { BroadsideKit } from "../../e2e/suites/broadside/kit.ts";
import { emulations, lastSent, recordingSuite, timeline, type Stage } from "../../test-support/recording-suite.ts";

type Box = { l: number; r: number; t: number; b: number; w: number };
const box = (l: number, r: number, t: number, b: number): Box => ({ l, r, t, b, w: r - l });
type LegendRoom = {
  lg: Box;
  bl: Box;
  sl: Box;
  gl: Box;
  sh: Box;
  folioText: number;
  w: number;
  h: number;
  fonts: string;
  moving: boolean;
};
// Clear wherever the row stands at 256 or more and its right edge clears the slip and the Glass; a row at 100 or 150 sits over the folio.
const legendRoom = (w: number, h: number, sheetR: number, lgL: number, over: Partial<LegendRoom> = {}): LegendRoom => ({
  lg: box(lgL, lgL + 300, h - 60, h - 30),
  bl: box(20, 260, h - 120, h - 20),
  sl: box(w - 420, w - 20, 80, h - 20),
  gl: box(w - 500, w - 440, h - 200, h - 120),
  sh: box(40, sheetR, 40, h - 200),
  folioText: 240,
  w,
  h,
  fonts: "loaded",
  moving: false,
  ...over,
});
const AT_1280 = legendRoom(1280, 2263, 700, 300);
const AT_1680 = legendRoom(1680, 900, 1000, 500);
const AT_800 = legendRoom(1280, 800, 650, 320);
// After an override: a stray layout at the old window, the new window over the old layout, the row still in its transition, then rest.
const resized = (from: LegendRoom, to: LegendRoom, strayR: number): Stage<LegendRoom> => ({
  phases: [
    [2, { ...from, sh: box(40, strayR, 40, from.h - 200), lg: box(100, 400, from.h - 60, from.h - 30) }],
    [2, { ...to, sh: from.sh, lg: box(100, 400, to.h - 60, to.h - 30) }],
    [2, { ...to, moving: true, lg: box(150, 450, to.h - 60, to.h - 30) }],
  ],
  rest: to,
});
const BOOT: Stage<LegendRoom> = {
  phases: [
    [2, { ...AT_1280, fonts: "loading", lg: box(100, 400, 2203, 2233) }],
    [2, { ...AT_1280, moving: true, lg: box(150, 450, 2203, 2233) }],
  ],
  rest: AT_1280,
};
const legendRun = (stages: readonly Stage<LegendRoom>[]) => {
  const room = timeline(stages);
  const run = recordingSuite((expression, sent) => (expression === LEGEND_ROOM ? room.next(emulations(sent)) : null));
  return { ...run, last: room.last, br1c: () => br1cLegendClears(run.ctx as unknown as BroadsideKit) };
};

test("BR1c reads each size only once the room has laid out there and the legend row has stopped moving, and leaves the room laid out again at the harness's window", async () => {
  const { br1c, checked, sent, last } = legendRun([
    BOOT,
    resized(AT_1280, AT_1680, 777),
    resized(AT_1680, AT_800, 999),
    resized(AT_800, AT_1280, 555),
  ]);
  await br1c();
  assert.deepEqual(checked, [{ code: "BR1c", ok: true }]);
  assert.deepEqual(
    sent.map((s) => s.method),
    [
      "Emulation.setDeviceMetricsOverride",
      "Emulation.setDeviceMetricsOverride",
      "Emulation.clearDeviceMetricsOverride",
    ],
  );
  assert.deepEqual(
    last(),
    AT_1280,
    "BR1c handed the suite back before the room laid out again at the harness's window",
  );
});

test("BR1c times out naming the 1680 layout when the room never lays out at 1680x900, and clears the override", async () => {
  const stuck: Stage<LegendRoom> = { phases: [], rest: { ...AT_1680, sh: AT_1280.sh } };
  const { br1c, sent } = legendRun([BOOT, stuck]);
  await assert.rejects(br1c(), (err: Error) =>
    err.message.startsWith("settle timeout BR1c the room laid out at 1680x900: "),
  );
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});

test("BR1c times out naming the way back when the window never leaves 1280x800 after the clear", async () => {
  const { br1c } = legendRun([
    BOOT,
    resized(AT_1280, AT_1680, 777),
    resized(AT_1680, AT_800, 999),
    { phases: [], rest: AT_800 },
  ]);
  await assert.rejects(br1c(), (err: Error) =>
    err.message.startsWith("settle timeout BR1c the room laid out again after the override: "),
  );
});

test("BR5 reads the note straight after each real mouse move and pauses for nothing, since the move's own dispatch lands the hover", async () => {
  const run = recordingSuite((expression) =>
    expression.includes("getBoundingClientRect") ? { x: 300, y: 200 } : true,
  );
  await br5Hover(run.ctx as unknown as BroadsideKit);
  assert.deepEqual(run.checked, [{ code: "BR5", ok: true }]);
  assert.deepEqual(run.slept, [], "BR5 paused after a mouse move");
});

type Narrow = { iw: number; ih: number; sheet: Box };
const HARNESS_NARROW: Narrow = { iw: 1280, ih: 2263, sheet: box(40, 700, 40, 2063) };
const TABLET: Narrow = { iw: 1024, ih: 700, sheet: box(30, 520, 40, 500) };
const SEATED = { x: 400, y: 300 };
const tabletRun = ({ laysOut = true, clicks = true }: { laysOut?: boolean; clicks?: boolean } = {}) => {
  const room = timeline<Narrow>([
    { phases: [], rest: HARNESS_NARROW },
    {
      phases: [
        [2, { ...HARNESS_NARROW, sheet: box(5, 5, 5, 5) }],
        [2, { ...TABLET, sheet: HARNESS_NARROW.sheet }],
      ],
      rest: laysOut ? TABLET : { ...TABLET, sheet: HARNESS_NARROW.sheet },
    },
  ]);
  const page = { clicks: 0, pending: Infinity, hit: false, open: false };
  const run = recordingSuite((expression, sent) => {
    if (expression === NARROW) return room.next(emulations(sent));
    if (expression === MARK) return room.last() === TABLET ? SEATED : { x: 100, y: 100 };
    if (expression === CLICKS) {
      if (--page.pending === 0) {
        page.clicks++;
        if (page.hit) page.open = !page.open;
      }
      return { n: page.clicks };
    }
    if (expression === TAPPED) return { stayed: true, open: page.open, hasLink: true };
    return true;
  });
  const touch = (type: string, points: readonly { x: number; y: number }[]): Promise<unknown> => {
    if (type === "touchStart")
      page.hit = JSON.stringify({ x: points[0]!.x, y: points[0]!.y }) === JSON.stringify(SEATED);
    if (type === "touchEnd") page.pending = clicks ? 2 : Infinity;
    return Promise.resolve({});
  };
  const k = { ...run.ctx, touch } as unknown as BroadsideKit;
  return { ...run, br6: () => br6Tap(k) };
};

test("BR6 taps only once the room has laid out at 1024x700, reads each tap only once its click has reached the page, and still leaves a pending navigation its window", async () => {
  const { br6, checked, slept, sent } = tabletRun();
  await br6();
  assert.deepEqual(checked, [{ code: "BR6", ok: true }]);
  assert.equal(slept.filter((ms) => ms === 500).length, 2, "a tap's navigation window went");
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});

test("BR6 times out naming the tablet's layout when the room never lays out at 1024x700, and gives the window back", async () => {
  const { br6, sent } = tabletRun({ laysOut: false });
  await assert.rejects(br6(), (err: Error) =>
    err.message.startsWith("settle timeout BR6 the room laid out at 1024x700: "),
  );
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});

test("BR6 times out naming the tap's click when no click reaches the page, and gives the window back", async () => {
  const { br6, sent } = tabletRun({ clicks: false });
  await assert.rejects(br6(), (err: Error) => err.message.startsWith("settle timeout BR6 the tap's click: "));
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});
```

**`test/e2e/reading-room-waits.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { rr18Park, rr22MidPlay, SWEEP } from "../../e2e/suites/reading-room/colophon.ts";
import { rr31StripStands, rr35GoverningBudget, rr37Envelope, WIDE } from "../../e2e/suites/reading-room/desk.ts";
import { DESK, stripRead, type Room as DeskRoom, type Strip } from "../../e2e/suites/reading-room/reads.ts";
import { emulations, lastSent, recordingSuite, timeline, type Stage } from "../../test-support/recording-suite.ts";

const strip = (h: number, gutter: string): Strip => ({
  position: "fixed",
  top: 900 - h,
  bottom: 0,
  h,
  toldAbove: true,
  toldHidden: false,
  toldDisplay: "flex",
  gutter,
  text: "the told row",
});
const DESK_ROOM: DeskRoom = {
  page: 900,
  vh: 900,
  chartW: 1100,
  chartH: 851,
  ratio: 1158 / 1500,
  fillsSheet: true,
  topClear: 20,
  bottomClear: 20,
};

test("RR31 and RR35 read the strip straight after the scroll and each range move, and pause for nothing, since the page handles both inside the evaluate that makes them", async () => {
  const gutters = ["1059", "day 3", "1059"];
  const run = recordingSuite((expression) => (expression === stripRead ? strip(100, gutters.shift() ?? "1059") : null));
  await rr31StripStands(run.ctx, strip(100, "1059"), DESK_ROOM);
  await rr35GoverningBudget(run.ctx, strip(100, "1059"));
  assert.deepEqual(run.checked, [
    { code: "RR31", ok: true },
    { code: "RR35", ok: true },
  ]);
  assert.deepEqual(run.slept, [], "RR31 or RR35 paused after an action the page handles at once");
});

type Wide = { iw: number; ih: number; sheet: number[] | null; strip: Strip | null };
type DeskRead = { iw: number; ih: number; sheet: number[] | null };
const DESK_SHEET = [122.17, 144.73, 740.27, 571.45];
const NARROW_SHEET = [40, 60, 600, 463.2];
const wideAt = (iw: number, h: number, sheet: number[]): Wide => ({ iw, ih: 900, sheet, strip: strip(h, "day 3") });
const deskStage = (rested: boolean): Stage<DeskRead> => ({
  phases: [
    [2, { iw: 768, ih: 900, sheet: [5, 5, 5, 5] }],
    [2, { iw: 1440, ih: 900, sheet: NARROW_SHEET }],
  ],
  rest: rested ? { iw: 1440, ih: 900, sheet: DESK_SHEET } : { iw: 1440, ih: 900, sheet: NARROW_SHEET },
});
const envelopeRun = ({ reaches900 = true, backAtDesk = true }: { reaches900?: boolean; backAtDesk?: boolean } = {}) => {
  const widths = timeline<Wide>([
    { phases: [], rest: wideAt(1440, 100, DESK_SHEET) },
    { phases: [[2, wideAt(1440, 100, DESK_SHEET)]], rest: wideAt(1024, 126, [30, 60, 640, 494]) },
    {
      phases: [[2, wideAt(1024, 126, [30, 60, 640, 494])]],
      rest: reaches900 ? wideAt(900, 126, [35, 60, 620, 478.6]) : wideAt(1024, 126, [30, 60, 640, 494]),
    },
    { phases: [[2, wideAt(900, 126, [35, 60, 620, 478.6])]], rest: wideAt(768, 126, NARROW_SHEET) },
  ]);
  const desk = timeline<DeskRead>([
    { phases: [], rest: { iw: 768, ih: 900, sheet: NARROW_SHEET } },
    deskStage(backAtDesk),
  ]);
  const run = recordingSuite((expression, sent) => {
    if (expression === WIDE) return widths.next(emulations(sent));
    if (expression === DESK) return desk.next(emulations(sent) - 3);
    return null;
  });
  return { ...run, envelope: () => rr37Envelope(run.ctx, strip(100, "day 3")) };
};

test("RR37 reads each width's strip only once the window reads that width, and hands back only once the room has laid out again at 1440x900", async () => {
  const { envelope, checked, said, slept } = envelopeRun();
  await envelope();
  assert.deepEqual(checked, [{ code: "RR37", ok: true }]);
  const deskReads = said.filter((e) => e === DESK).length;
  assert.equal(deskReads, 6, "RR37 handed back before the room laid out again at 1440x900, or kept reading after");
  assert.deepEqual([...new Set(slept)], [50], "RR37 paused other than to poll");
});

test("RR37 times out naming the width when the window never reaches it, and puts the desk's window back", async () => {
  const { envelope, sent } = envelopeRun({ reaches900: false });
  await assert.rejects(envelope(), (err: Error) => err.message.startsWith("settle timeout RR37 the strip at 900: "));
  assert.deepEqual(lastSent(sent)?.params, { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
});

test("RR37 times out naming the desk when the room never lays out again at 1440x900", async () => {
  const { envelope } = envelopeRun({ backAtDesk: false });
  await assert.rejects(envelope(), (err: Error) =>
    err.message.startsWith("settle timeout RR37 the room laid out again at 1440x900: "),
  );
});

test("RR18 reads the park straight after the range is driven to it and pauses for nothing, since the bar's input and change are handled inside that evaluate", async () => {
  const run = recordingSuite((expression) =>
    expression.includes("__vellumReadingRoomAges")
      ? {
          ages: { chamber: "ages", year: 1059 },
          play: "Play",
          panelHidden: false,
          hash: "#seed=42&year=1059",
          entries: 5,
          inked: 5,
        }
      : null,
  );
  await rr18Park(run.ctx);
  assert.deepEqual(run.checked, [
    { code: "RR18", ok: true },
    { code: "RR19", ok: true },
  ]);
  assert.deepEqual(run.slept, [], "RR18 paused after the range move");
});

const playRun = (sweeps: boolean) => {
  const sweep = { played: false, reads: 0, atRead: null as number | null };
  const u = (): number => (sweep.played && sweeps && sweep.reads > 2 ? 0.01 * sweep.reads : 1);
  const run = recordingSuite((expression) => {
    if (expression === SWEEP) {
      if (sweep.played) sweep.reads++;
      return { u: u() };
    }
    if (expression.includes(".rr-read")) {
      sweep.atRead = u();
      return null;
    }
    if (expression.includes('.rf-play").click()')) {
      sweep.played = true;
      return null;
    }
    if (expression.includes("return{label")) return { label: "Pause" };
    return {
      seed: 42,
      title: "The Isle of Rahai",
      status: "",
      chamber: "ages",
      play: "Play",
      entries: 5,
      inked: 5,
    };
  });
  return { ...run, sweep, rr22: () => rr22MidPlay(run.ctx) };
};

test("RR22 presses Read only once the sweep Play started is under way", async () => {
  const { rr22, checked, sweep } = playRun(true);
  await rr22();
  assert.deepEqual(checked, [{ code: "RR22", ok: true }]);
  assert.ok(sweep.atRead !== null && sweep.atRead !== 1, `Read was pressed before the sweep moved: u ${sweep.atRead}`);
});

test("RR22 times out naming the sweep when Play never starts it", async () => {
  const { rr22 } = playRun(false);
  await assert.rejects(rr22(), (err: Error) => err.message.startsWith("settle timeout RR22 the sweep under way: "));
});
```

**`test/e2e/gallery-waits.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { rh10GalleryScrolled, SCROLLED } from "../../e2e/suites/runninghead/gallery.ts";
import type { RunningHeadKit } from "../../e2e/suites/runninghead/kit.ts";
import { recordingSuite } from "../../test-support/recording-suite.ts";

const galleryRun = (lands: boolean) => {
  let witnessed = 0;
  let landed = false;
  let sampledLanded: boolean | null = null;
  const run = recordingSuite((expression) => {
    if (expression.includes(".grid img"))
      return JSON.stringify({ sh: 3000, y: 1200, plate: { x: 400, y: 300 }, loaded: true });
    if (expression.includes(SCROLLED) && expression.includes("getAnimations")) {
      witnessed++;
      landed = lands && witnessed > 3;
      return { read: { y: 1200 }, anims: [landed ? "finished" : "running"] };
    }
    return expression === SCROLLED ? { y: 1200 } : null;
  });
  const send = (method: string, params?: Record<string, unknown>): Promise<unknown> => {
    run.sent.push({ method, params });
    if (method !== "Runtime.evaluate") return Promise.resolve({});
    sampledLanded = landed;
    return Promise.resolve({ exceptionDetails: { text: "stub stop" } });
  };
  const k = { ...run.ctx, send, visit: () => Promise.resolve(true) } as unknown as RunningHeadKit;
  return { ...run, rh10: () => rh10GalleryScrolled(k), sampled: () => sampledLanded };
};

test("RH10 samples the plate only once the Gallery's landing has finished", async () => {
  const { rh10, sampled } = galleryRun(true);
  await assert.rejects(
    rh10(),
    (err: Error) => err.message === "sampleRect could not read the page's scroll: stub stop",
  );
  assert.equal(sampled(), true, "RH10 sampled the plate while the Gallery was still landing");
});

test("RH10 times out naming the landing when the Gallery never finishes landing, and samples nothing", async () => {
  const { rh10, sampled } = galleryRun(false);
  await assert.rejects(rh10(), (err: Error) =>
    err.message.startsWith("settle timeout RH10 the Gallery's plates landed: "),
  );
  assert.equal(sampled(), null, "RH10 sampled the plate though the Gallery never landed");
});
```

## Tests, in the order they are written

All sixteen are written in commit 1, against today's code plus the stub below, and each fake is a recording suite context (`recordingSuite` in `test-support/recording-suite.ts`) that answers a payload by identity with the exported constant and records every `send`, `sleep` and `check`. Where a room lays out, it lays out only as far as it is read (`timeline`): each read after an emulation moves it one phase on (a stray layout at the old window, the new window over the old layout, the row still in its transition, then rest), so a wait that stops reading early acts on a room still in flight, and every in-flight phase lasts two equal reads, so a wait that dropped a clause would settle on it.

| # | file | test name | asserts | red on the stub | mutations that red it |
|---|---|---|---|---|---|
| T1 | `broadside-waits` | "BR1c reads each size only once the room has laid out there and the legend row has stopped moving, and leaves the room laid out again at the harness's window" | BR1c checks true (every in-flight phase seats the row over the folio, so a read taken in flight reads false); the sends are the two overrides and the clear; the last room answered is the harness's rest | `deepStrictEqual` | M1 to M8, M10 |
| T2 | same | "BR1c times out naming the 1680 layout when the room never lays out at 1680x900, and clears the override" | rejects `settle timeout BR1c the room laid out at 1680x900: `; the last send is the clear | `Missing expected rejection` | M4, M9 |
| T3 | same | "BR1c times out naming the way back when the window never leaves 1280x800 after the clear" | rejects `settle timeout BR1c the room laid out again after the override: ` | `Missing expected rejection` | M10 |
| T4 | same | "BR5 reads the note straight after each real mouse move and pauses for nothing, since the move's own dispatch lands the hover" | BR5 true; nothing slept | message "BR5 paused after a mouse move" | M11 |
| T5 | same | "BR6 taps only once the room has laid out at 1024x700, reads each tap only once its click has reached the page, and still leaves a pending navigation its window" | BR6 true (a tap lands on the mark only at its laid-out seat, and the note toggles only when the click arrives, both counted in reads); two 500 ms windows slept; the last send is the clear | `deepStrictEqual` | M12 to M15, M17 |
| T6 | same | "BR6 times out naming the tablet's layout when the room never lays out at 1024x700, and gives the window back" | rejects `settle timeout BR6 the room laid out at 1024x700: `; the last send is the clear | `Missing expected rejection` | M12, M13, M16 |
| T7 | same | "BR6 times out naming the tap's click when no click reaches the page, and gives the window back" | rejects `settle timeout BR6 the tap's click: `; the last send is the clear | `Missing expected rejection` | M14, M15, M16 |
| T8 | `reading-room-waits` | "RR31 and RR35 read the strip straight after the scroll and each range move, and pause for nothing, since the page handles both inside the evaluate that makes them" | RR31 and RR35 true; nothing slept | message "RR31 or RR35 paused after an action the page handles at once" | M23, M24 |
| T9 | same | "RR37 reads each width's strip only once the window reads that width, and hands back only once the room has laid out again at 1440x900" | RR37 true (a strip read at the old width reads the desk's 100, which fails RR37's witness clause); six `DESK` reads, the rest the sixth; every pause is a 50 ms poll's | `deepStrictEqual` | M18 to M22 |
| T10 | same | "RR37 times out naming the width when the window never reaches it, and puts the desk's window back" | rejects `settle timeout RR37 the strip at 900: `; the last send is the 1440x900 override | `Missing expected rejection` | M18, M19 |
| T11 | same | "RR37 times out naming the desk when the room never lays out again at 1440x900" | rejects `settle timeout RR37 the room laid out again at 1440x900: ` | `Missing expected rejection` | M18, M20, M21 |
| T12 | same | "RR18 reads the park straight after the range is driven to it and pauses for nothing, since the bar's input and change are handled inside that evaluate" | RR18 and RR19 true; nothing slept | message "RR18 paused after the range move" | M25 |
| T13 | same | "RR22 presses Read only once the sweep Play started is under way" | RR22 true; the sweep's `u` when Read is pressed is not the 1 it read before Play | message "Read was pressed before the sweep moved: u 1" | M26, M27 |
| T14 | same | "RR22 times out naming the sweep when Play never starts it" | rejects `settle timeout RR22 the sweep under way: ` | `Missing expected rejection` | M26, M27 |
| T15 | `gallery-waits` | "RH10 samples the plate only once the Gallery's landing has finished" | the first pixel read (`sampleRect`'s scroll read, answered with an exception so the run stops there, `sampleRect could not read the page's scroll: stub stop`) comes after the grid's animation read finished | message "RH10 sampled the plate while the Gallery was still landing" | M28, M29 |
| T16 | same | "RH10 times out naming the landing when the Gallery never finishes landing, and samples nothing" | rejects `settle timeout RH10 the Gallery's plates landed: `; no pixel read sent | validation function returned false | M28, M29 |

**The stub (commit 1).** Today's behaviour in the planned shape: the new exports exist and today's functions read through them, every pause still in place. Staged over e46fbe1b (`out/785-laneB-dry-run/stub.diff`), the three files read **16 failing, 0 passing**, every red an `AssertionError` (7 `Missing expected rejection`, 3 `deepStrictEqual`, 1 validation function, 5 on the test's own message, as tabled; `out/785-laneB-dry-run/stub-tests.log`), tsc, the lint and Prettier clean over it (`stub-lint.log`), and the other 406 e2e and repo-e2e tests pass (`stub-e2e-tests.log`). On the finished build all 16 pass. The stub, exactly:

```diff
--- a/e2e/suites/broadside.ts
+++ b/e2e/suites/broadside.ts
@@ -8,8 +8,44 @@
 import { broadsideKit, type BroadsideKit } from "./broadside/kit.ts";
 
 type Box = { l: number; r: number; t: number; b: number; w: number } | null;
-type Room = { lg: Box; bl: Box; sl: Box; gl: Box; sh: Box; folioText: number; w: number; h: number };
+type Room = {
+  lg: Box;
+  bl: Box;
+  sl: Box;
+  gl: Box;
+  sh: Box;
+  folioText: number;
+  w: number;
+  h: number;
+  fonts: string;
+  moving: boolean;
+};
 
+// The row's left transitions 0.32s to the seat the room writes, and the room writes it again on `document.fonts.ready` and on every resize, so a read waits for the fonts and for no animation running on the row.
+export const LEGEND_ROOM: Payload<Room> = `(()=>{const r=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();return{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)};};
+      const lg=r(".legend"),bl=r(".corner.bl"),sl=r("#broadside"),gl=r(".corner.br"),sh=r("#sheet");
+      const range=document.createRange();let text=0;for(const p of document.querySelectorAll(".corner.bl p")){if(!p.textContent)continue;range.selectNodeContents(p);text=Math.max(text,range.getBoundingClientRect().right);}
+      const row=document.querySelector(".legend");const moving=!!row&&row.getAnimations().some((a)=>a.playState==="running");
+      return{lg,bl,sl,gl,sh,folioText:Math.round(text),w:innerWidth,h:innerHeight,fonts:document.fonts.status,moving};})()`;
+const legendClear = (m: Room): boolean =>
+  !!m.lg &&
+  m.lg.l >= m.folioText + 16 &&
+  m.lg.r <= m.sl!.l - 8 &&
+  m.lg.r <= m.gl!.l - 8 &&
+  m.sh!.r <= m.gl!.l - 8 &&
+  m.sh!.b <= Math.min(m.bl!.t, m.lg.t) - 8;
+type Narrow = { iw: number; ih: number; sheet: Box };
+export const NARROW: Payload<Narrow> = `(()=>{const e=document.getElementById("sheet");const b=e?e.getBoundingClientRect():null;return{iw:innerWidth,ih:innerHeight,sheet:b&&{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)}};})()`;
+export const CLICKS: Payload<{ n: number }> = `({ n: window.__br6Clicks })`;
+type Tapped = { stayed: boolean; open: boolean; hasLink: boolean };
+export const TAPPED: Payload<Tapped> = `(()=>{const n=document.getElementById("note-survey");
+    return{stayed:location.pathname==="/explorer/",open:!!n&&n.matches(":popover-open"),
+      hasLink:!!document.querySelector('#note-survey a[href="/glossary/#survey"]')};})()`;
+export const MARK: Payload<Point | null> = `(()=>{const m=document.querySelector('a.fn[data-note="note-survey"]');
+      if(!m)return null;
+      m.scrollIntoView({block:"center"});const r=m.getBoundingClientRect();
+      return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`;
+
 export async function run(ctx: SuiteContext): Promise<void> {
   const { consoleErrors, http4xx } = ctx;
   // BR3 through BR6 and BR8 are deliberately not stepped: the reads and gestures in them return rather than throwing, and their checks already guard on it.
@@ -71,26 +107,15 @@
   );
 }
 
-async function br1cLegendClears({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
-  const legendRoom: Payload<Room> = `(()=>{const r=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();return{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)};};
-      const lg=r(".legend"),bl=r(".corner.bl"),sl=r("#broadside"),gl=r(".corner.br"),sh=r("#sheet");
-      const range=document.createRange();let text=0;for(const p of document.querySelectorAll(".corner.bl p")){if(!p.textContent)continue;range.selectNodeContents(p);text=Math.max(text,range.getBoundingClientRect().right);}
-      return{lg,bl,sl,gl,sh,folioText:Math.round(text),w:innerWidth,h:innerHeight};})()`;
-  const legendClear = (m: Room): boolean =>
-    !!m.lg &&
-    m.lg.l >= m.folioText + 16 &&
-    m.lg.r <= m.sl!.l - 8 &&
-    m.lg.r <= m.gl!.l - 8 &&
-    m.sh!.r <= m.gl!.l - 8 &&
-    m.sh!.b <= Math.min(m.bl!.t, m.lg.t) - 8;
+export async function br1cLegendClears({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
   await sleep(400); // the row's left transitions 0.32s to its measured seat; a read mid-flight is the old seat
-  const at1280 = await evaluate(legendRoom);
+  const at1280 = await evaluate(LEGEND_ROOM);
   await send("Emulation.setDeviceMetricsOverride", { width: 1680, height: 900, deviceScaleFactor: 1, mobile: false });
   await sleep(600);
-  const at1680 = await evaluate(legendRoom);
+  const at1680 = await evaluate(LEGEND_ROOM);
   await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
   await sleep(600);
-  const back = await evaluate(legendRoom);
+  const back = await evaluate(LEGEND_ROOM);
   await send("Emulation.clearDeviceMetricsOverride");
   await sleep(600);
   check(
@@ -195,7 +220,7 @@
   );
 }
 
-async function br5Hover({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
+export async function br5Hover({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
   const rect = await evaluate<Point>(`(()=>{const m=document.querySelector('a.fn[data-note="note-coast-warp"]');
     const r=m.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
   await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
@@ -211,31 +236,28 @@
   );
 }
 
-async function br6Tap({ evaluate, check, sleep, touch, setNarrowViewport, clearMobile }: BroadsideKit): Promise<void> {
+export async function br6Tap({
+  evaluate,
+  check,
+  sleep,
+  touch,
+  setNarrowViewport,
+  clearMobile,
+}: BroadsideKit): Promise<void> {
   // REAL CDP taps fire the full compat sequence a synthetic .click() skips (which once hid an off-by-one here); device metrics + touch emulation is what actually flips the hover/pointer media in this browser, setEmulatedMedia's feature overrides are a no-op.
   await setNarrowViewport(1024, 700);
   const emulated = await evaluate<boolean>(`window.matchMedia("(hover: none)").matches`);
   await sleep(120);
   // The post-tap sleep lets a pending anchor navigation COMMIT before a fresh evaluate reads the path: a same-evaluate read cannot see it (the guard-prover proved a dropped preventDefault survived that shape).
   const tapAt = async (): Promise<boolean> => {
-    const p = await evaluate<Point | null>(`(()=>{const m=document.querySelector('a.fn[data-note="note-survey"]');
-      if(!m)return null;
-      m.scrollIntoView({block:"center"});const r=m.getBoundingClientRect();
-      return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
+    const p = await evaluate(MARK);
     if (!p) return false;
     await touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
     await touch("touchEnd", []);
     await sleep(500); // past the tap-dismiss window, and past any pending navigation's commit
     return true;
   };
-  const probe = () =>
-    evaluate<{
-      stayed: boolean;
-      open: boolean;
-      hasLink: boolean;
-    }>(`(()=>{const n=document.getElementById("note-survey");
-    return{stayed:location.pathname==="/explorer/",open:!!n&&n.matches(":popover-open"),
-      hasLink:!!document.querySelector('#note-survey a[href="/glossary/#survey"]')};})()`);
+  const probe = () => evaluate(TAPPED);
   const tapped1 = await tapAt();
   const afterTap1 = await probe();
   const tapped2 = await tapAt();
--- a/e2e/suites/reading-room.ts
+++ b/e2e/suites/reading-room.ts
@@ -1,8 +1,9 @@
 // Reading Room e2e (RR0-RR43; Issue #221 plus Issue #318 colophon dice, Issue #418 pre-arm window, Issue #402 prospect stage and Issue #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on Issue #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
 import { makeSettle, makeStable } from "../support/settle.ts";
 import { makeStep } from "../support/step.ts";
-import type { Payload, SuiteContext } from "../types.ts";
+import type { SuiteContext } from "../types.ts";
 import { readingRoomKit, type ReadingRoomKit } from "./reading-room/kit.ts";
+import { DESK, atDesk, sameSheet } from "./reading-room/reads.ts";
 import { rr0Boots, rr4AtRest, rr26BareVisit, rr29Play } from "./reading-room/arrival.ts";
 import { rrDeskReads } from "./reading-room/desk.ts";
 import { rr6Survey, rr7Year, rr9Today, rr10CrossLinks } from "./reading-room/addresses.ts";
@@ -22,10 +23,6 @@
 import { rr40Glass, rr41ReadRefits, rr42PlateReveal } from "./reading-room/gestures.ts";
 
 type Step = ReturnType<typeof makeStep>;
-type Desk = { iw: number; ih: number; sheet: number[] | null };
-const DESK: Payload<Desk> = `(() => { const e = document.getElementById("sheet"); const b = e ? e.getBoundingClientRect() : null; return { iw: innerWidth, ih: innerHeight, sheet: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
-const atDesk = (d: Desk): boolean => d.iw === 1440 && d.ih === 900;
-const sameSheet = (a: Desk, b: Desk): boolean => JSON.stringify(a.sheet) === JSON.stringify(b.sheet);
 
 export async function run(ctx: SuiteContext): Promise<void> {
   const { send, shoot, consoleErrors, http4xx, PORT } = ctx;
--- a/e2e/suites/reading-room/colophon.ts
+++ b/e2e/suites/reading-room/colophon.ts
@@ -1,7 +1,10 @@
-import type { SuiteContext } from "../../types.ts";
+import type { Payload, SuiteContext } from "../../types.ts";
 import type { ReadingRoomKit } from "./kit.ts";
 import type { Ages } from "./reads.ts";
 
+export const SWEEP: Payload<{ u: number | null }> =
+  `(()=>{const a=window.__vellumReadingRoomAges();return{u:a?a.u:null};})()`;
+
 export async function rr16Colophon({ evaluate, check }: SuiteContext): Promise<void> {
   const colo = await evaluate<{
     input: boolean;
--- a/e2e/suites/reading-room/desk.ts
+++ b/e2e/suites/reading-room/desk.ts
@@ -1,7 +1,10 @@
 import type { Payload, SuiteContext } from "../../types.ts";
-import { GOVERNING_BUDGET, stripRead, WIDE_WORST } from "./reads.ts";
-import type { Room, Strip } from "./reads.ts";
+import { DESK, GOVERNING_BUDGET, stripRead, WIDE_WORST } from "./reads.ts";
+import type { Desk, Room, Strip } from "./reads.ts";
 
+type Wide = Desk & { strip: Strip | null };
+export const WIDE: Payload<Wide> = `(() => ({ ...(${DESK}), strip: (${stripRead}) }))()`;
+
 export async function rr31StripStands(
   { evaluate, check, sleep }: SuiteContext,
   deskRest: Strip | null,
--- a/e2e/suites/reading-room/reads.ts
+++ b/e2e/suites/reading-room/reads.ts
@@ -33,6 +33,11 @@
   bottomClear: number;
 };
 
+export type Desk = { iw: number; ih: number; sheet: number[] | null };
+export const DESK: Payload<Desk> = `(() => { const e = document.getElementById("sheet"); const b = e ? e.getBoundingClientRect() : null; return { iw: innerWidth, ih: innerHeight, sheet: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
+export const atDesk = (d: Desk): boolean => d.iw === 1440 && d.ih === 900;
+export const sameSheet = (a: Desk, b: Desk): boolean => JSON.stringify(a.sheet) === JSON.stringify(b.sheet);
+
 export const agesRead: Payload<AgesRead> = `(()=>{const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const panel=document.querySelector(".rf-ages");return{ages:a,play:p?p.textContent:null,panelHidden:panel?panel.hidden:null,hash:location.hash};})()`;
 // Issue #402 the prospect stage: href read raw (getAttribute), src as the browser's absolute blob URL. Placement ruled 2026-08-22: inside the panel, below the sticky strip (Issue #442 wrapped the bar in one), above the journal.
 export const stageRead: Payload<Stage | null> = `(()=>{const f=document.querySelector(".rr-prospect");if(!f)return null;const img=f.querySelector("img");const a=f.querySelector("a");const panel=document.querySelector(".rf-ages");const prev=f.previousElementSibling;const next=f.nextElementSibling;return{hidden:f.hidden,src:img?String(img.src||""):null,alt:img?img.alt:null,href:a?a.getAttribute("href"):null,inSlip:!!f.closest("#journal .journal-dock"),aboveLog:!!(next&&next.classList.contains("rf-log")),belowBar:!!(panel&&panel.contains(f)&&prev&&prev.classList.contains("rf-instrument-strip")&&next&&next.classList.contains("rf-log"))};})()`;
--- a/e2e/suites/runninghead/gallery.ts
+++ b/e2e/suites/runninghead/gallery.ts
@@ -3,6 +3,8 @@
 import { makeSettle } from "../../support/settle.ts";
 import type { Payload, Point } from "../../types.ts";
 import type { RunningHeadKit } from "./kit.ts";
+
+export const SCROLLED: Payload<{ y: number }> = `({ y: scrollY })`;
 
 export async function rh10GalleryScrolled({ evaluate, send, check, sleep, visit }: RunningHeadKit): Promise<void> {
   // The harness window is tall, so this check pins its own viewport; the Gallery is the one chart room that scrolls.
```

**The mutations**, each a by-text edit of the finished build, run alone over the staged copy by `node out/785-laneB-dry-run/mutate.ts` (log `out/785-laneB-dry-run/mutate.log`, both controls clean): **29 of 29 bite, each red exactly the tests the table above names.**

| id | file | the edit |
|---|---|---|
| M1 | `e2e/suites/broadside.ts` | `departed: (d) => d.fonts === "loaded" && !d.moving,` made `departed: (d) => !d.moving,` |
| M2 | same | the same line made `departed: (d) => d.fonts === "loaded",` |
| M3 | same | `d.w === w && d.h === h && !sameBox(d.sh, from.sh) && !d.moving;` made `!sameBox(d.sh, from.sh) && !d.moving;` |
| M4 | same | the same line made `d.w === w && d.h === h && !d.moving;` |
| M5 | same | the same line made `d.w === w && d.h === h && !sameBox(d.sh, from.sh);` |
| M6 | same | `departed: (d) => d.h !== 800 && !sameBox(d.sh, back.sh) && !d.moving,` made `departed: (d) => !sameBox(d.sh, back.sh) && !d.moving,` |
| M7 | same | the same line made `departed: (d) => d.h !== 800 && !d.moving,` |
| M8 | same | the same line made `departed: (d) => d.h !== 800 && !sameBox(d.sh, back.sh),` |
| M9 | same | the `finally`'s `await send("Emulation.clearDeviceMetricsOverride");` moved out of the `finally`, to the line after it |
| M10 | same | the wait `"BR1c the room laid out again after the override"` deleted, all three lines |
| M11 | same | `sleep` destructured again in `br5Hover` and `await sleep(80);` put back after the first `mouseMoved` |
| M12 | same | `departed: (d) => d.iw === 1024 && d.ih === 700 && !sameBox(d.sheet, before.sheet),` made `departed: (d) => !sameBox(d.sheet, before.sheet),` |
| M13 | same | the same line made `departed: (d) => d.iw === 1024 && d.ih === 700,` |
| M14 | same | `await settle(CLICKS, (d) => d.n > n, "BR6 the tap's click");` deleted |
| M15 | same | `(d) => d.n > n, "BR6 the tap's click"` made `() => true, "BR6 the tap's click"` |
| M16 | same | `await narrowTaps(k, before).finally(() => clearMobile());` made `await narrowTaps(k, before);` with `await clearMobile();` on the next line |
| M17 | same | `await sleep(500); // past any pending navigation's commit` deleted |
| M18 | `e2e/suites/reading-room/desk.ts` | `{ departed: (d) => d.iw === w }` made `{ departed: () => true }` |
| M19 | same | `await across().finally(() => send("Emulation.setDeviceMetricsOverride", AT_DESK));` made `await across();` |
| M20 | same | `departed: (d) => atDesk(d) && !sameSheet(d, narrowest),` made `departed: (d) => !sameSheet(d, narrowest),` |
| M21 | same | the same line made `departed: (d) => atDesk(d),` |
| M22 | same | `await sleep(120);` put back above `const stable = makeStable(...)` in `rr37Envelope` |
| M23 | same | `sleep` destructured again in `rr31StripStands` and `await sleep(200);` put back after the scroll |
| M24 | same | `sleep` destructured again in `rr35GoverningBudget` and `await sleep(150);` put back before `const deskSurvey` |
| M25 | `e2e/suites/reading-room/colophon.ts` | `sleep` destructured again in `rr18Park` and `await sleep(150);` put back after the park's `evaluate` |
| M26 | same | the `makeSettle(...)(SWEEP, ..., "RR22 the sweep under way")` line deleted |
| M27 | same | `(d) => d.u !== null && d.u !== from.u` made `(d) => d.u !== null` |
| M28 | `e2e/suites/runninghead/gallery.ts` | the `if (scrolled)` wait deleted, all four lines |
| M29 | same | `animated: ".grid",` made `departed: () => true,` |

**The prover owes** M1 to M29, unit tests only, one round (Gate 1 item 9). Step 15 leaves nothing to the implementer to prove unless a finding changes a test. The implementer runs each mutation once itself first, or sends the list to the proof runner, and pastes the reds in the PR body's guard table.

**The browser readings.** None was taken (no browser, by the brief), so each is UNVERIFIABLE until the implementer's local run: every conversion's fixture reading is "its check passes and its wait returns", read off the suite's PASS lines, and the readings under a mutation are the unit tests above, since no probe can stage "the room never lays out" without editing source. The claims themselves are unchanged, so their own mutations stand as before. One browser row is owed to the proof runner, because the click witness moves where BR6's navigation window starts:

| row | edit (by text, once) | selection | expected red |
|---|---|---|---|
| P1 | `src/site/explorer/footnotes.ts`, in the `click` listener: `      e.preventDefault();` deleted | `broadside` | BR6 (as its check or as `BR6 never reached its assertion`), and any other the local run names |

## Order of commits

Branch `chore/785-laneB-waits`. `npm run format` before each commit.

1. This plan, unchanged, at `handbook/plans/785/785-laneB-plan.md`; `test-support/recording-suite.ts`; the three test files; the stub (above). `node --import ./test-support/source-read-guard.ts --test test/e2e/broadside-waits.test.ts test/e2e/reading-room-waits.test.ts test/e2e/gallery-waits.test.ts` reads 16 failing, 0 passing, each red as the Tests table names.
2. `e2e/suites/broadside.ts` finished (BR1c, BR5, BR6, the BR6 step and the line-15 comment). T1 to T7 green.
3. `e2e/suites/reading-room.ts` (the RR22 step), `e2e/suites/reading-room/colophon.ts`, `e2e/suites/reading-room/desk.ts` finished. T8 to T14 green.
4. `e2e/suites/prospect.ts` and `e2e/suites/runninghead/gallery.ts` finished. All 16 green; `git diff origin/main --stat` names exactly the eleven files under Files (seven edited, four new) and the plan.

## Rosters and doctrine

- No roster. The three test files join `npm test` by their names and read no source file, so `SOURCE_READS` (`test-support/source-read-list.ts`) is untouched; `test-support/recording-suite.ts` joins nothing (the lint reaches it by its `test-support/**/*.ts` root). Two new step names, `"BR6"` and `"RR22"`, are what an `E2E_SKIPS` entry or a proof selection would name; nothing lists step names (`git grep -n '"BR6"\|"RR22"' -- test test-support scripts .github e2e/support` prints nothing at e46fbe1b).
- No spec, gate or agent line is contradicted: clause 3 already makes a blind pause a poll to rest, clause 5's `carry` fact is what BR5's deletion leans on, and no `STILL_ONLY` reason is added.
- **The sort's class of `broadside.ts:228` changes from BLIND to SAMPLE** (justified, the navigation window), so row 12 (`785-lint`) writes one more pause in the lint's form. The frozen `785-plan.md` is not edited; the step 12 comment says so for row 12's planner.
- `MEASURED_SECONDS` and `e2e/support/skips.ts` are not touched.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`: each exit 0.
- `npm test -- test/e2e/broadside-waits.test.ts test/e2e/reading-room-waits.test.ts test/e2e/gallery-waits.test.ts test/e2e/kit-waits.test.ts test/repo/e2e-read-types.test.ts test/repo/e2e-steps.test.ts`: all pass; then `npm test` whole; then `npm run astro:generate`.
- The census: `node out/785-laneB-dry-run/sleep-sort.ts <tree>` (from the main checkout's `out/785-laneB-dry-run/`, with `LANE_B_ONLY=1`) lists no lane B BLIND; or, without the script, `git grep -n "sleep(" -- e2e/suites/broadside.ts e2e/suites/prospect.ts e2e/suites/reading-room/colophon.ts e2e/suites/reading-room/desk.ts e2e/suites/runninghead/gallery.ts` shows only the polls' pauses, `prospect.ts`'s `sleep(300)` before `refused` and `colophon.ts`'s `sleep(2000)` (row 12's SAMPLE), and `broadside.ts`'s `sleep(500)` in `tapAt`.
- `npm run build`, then one at a time, each after `ps aux | grep -c '[r]emote-debugging-port'` reads 0 and no other lane's suite is running: `VELLUM_E2E_SUITES=broadside npm run test:e2e`, `VELLUM_E2E_SUITES=prospect npm run test:e2e`, `VELLUM_E2E_SUITES=reading-room npm run test:e2e`, `VELLUM_E2E_SUITES=runninghead npm run test:e2e`, each ALL PASS, quoting the PASS lines of BR1c, BR5, BR6, PB7d, RR18, RR19, RR22, RR31, RR35, RR37, RR36, RR39 and RH10, and each suite's seconds beside today's.
- The pull request's CI green (lane B holds all four suites; `e2e/support/lanes.ts`).
- **Step seconds** (settle-doctrine, "Who finds a slow step"): no check is added, and no step is expected to grow (each wait replaces a longer pause; the pauses removed sum 5.15 s across the lane, and the windows kept are BR6's two of 500 ms). The body quotes, from the pull request's own lane B log, the seconds of the steps this changes (`BR1 to BR1c`, `BR6`, `PB7 to PB7d`, `RR22`, `RR31, RR35, RR37, RR36`, `RH10`, and RR18 counted alone) beside main's latest run. Any of them that reads longer than main's and at 4 s or more is named in the body and the step 12 comment; the hand-started runs the rule then asks for are the orchestrator's to start, not the implementer's (call 11).
- `vellum-guard-prover` on M1 to M29; proof-runner row P1.
- `vellum-plate-reader` is not owed: nothing here is an appearance.
- `gh pr view <N> --json closingIssuesReferences` reads `[]` (call 12).

## Calls made

Each is the least change that keeps every ruling (6407993113's "reasonable solution", read by the orchestrator as never licence to change a ruling).

1. **The deciding rule** (top of The design): a pause after an action handled inside its own `evaluate` or its own mouse move's dispatch is deleted; one after an action handled later gets a witness; a window an absence is read over stays for row 12. Rule: the brief ("for a pause that waits for nothing, delete it; for one that needs a witness, give it a departure or the animation witness") and clause 5's measured `carry` fact.
2. **BR1c's resizes and BR6's and RR37's return to the desk depart on the window and the sheet moved together**, `atTheDesk`'s form. Rule: the lane's own merged precedent (PR #1073), clause 5, and the trace both earlier plans took (the window flips at once, the room lays out a frame later).
3. **BR1c's first read departs on the fonts loaded and no animation running on the legend row**, with no action before it. Rule: the room re-seats the row on `document.fonts.ready`, which is the last boot action that can start the row's transition; a departure read against the state the check starts from (clause 5's last sentence).
4. **BR6's tap tail becomes a click witness plus today's 500 ms window, reclassified SAMPLE.** Rule: least change to BR6's claim; the window is the absence the claim reads, and only the click's arrival was a blind wait.
5. **BR5 is deleted, not given a hover witness.** Rule: the move's own dispatch lands the hover (clause 5's `carry` fact), and BR5 stays unstepped as the suite's comment says.
6. **RR22 becomes a `makeSettle` poll for the sweep's position moving**, not `makeStable`. Rule: a start, not a rest (`785-kits-plan.md`, "How the lane pull requests use it"), and the 785 plan's rule for a pause that places an interrupt mid-flight.
7. **RR37's widths wait on the window even though the strip is laid out by CSS.** Rule: no CI reading exists of a set override landing at once; the window is a cheap witness.
8. **PB7d's deletion has no unit test.** Rule: exporting `pb7YearFilter` breaks the lint's 50-line function limit (measured 54), and splitting it is more change than the deletion; PB7d's own browser check reads straight after the synchronous submit.
9. **RH10 waits on the grid's landing, not on the plate's decode.** Rule: `makeStable` refuses a promise read; today's pause never witnessed a decode either, and a blank plate reds RH10's own `plateLum`, so the blind spot errs toward a red by name.
10. **Every pause becomes its wait in place, and no `check(` moves.** Rule: least change; a restore wait that gives up fails its step by the wait's label, as `atTheDesk`'s RR29 step does.
11. **Step seconds are quoted from the pull request's own run; no CI run is started by hand by the implementer.** Rule: the brief ("do not run CI by hand for timing"), 6407764430, and the slow-step bullet, whose hand-started runs are left to the orchestrator if a step reads 4 s or more and longer than main's.
12. **The pull request leaves Issue #785 open.** Other rows of its sequence remain, and the orchestrator merges on green CI with no further word, so a closing keyword would shut the issue. The body's closing-reference line takes the template's form for a pull request that leaves its issue open, `Issue: #785, stays open because later rows of its sequence remain`, with no closing keyword beside the number (Gate 5 item 5).
13. **Three test files and one shared helper**, named for their suites and not for the lane. Rule: the lint's `max-lines` (one file read 414); a lane is a run's grouping, which Issue #1065 may reshuffle, and the files name what they test.
14. **`DESK`, `atDesk`, `sameSheet` move to `reads.ts`.** Rule: `desk.ts` needs them and importing them from `reading-room.ts`, which imports `desk.ts`, is a cycle; `reads.ts` already holds the room's shared reads.
15. **Recon done in-session, `vellum-spec-recon` not dispatched.** Rule: the brief and 6407993113; a departure from workflow step 2, named here.

## Stop conditions

Under 6407993113 these do not hand back: each names what the implementer will see if the plan is wrong, the least change that keeps every ruling, and that the fix goes in the PR body and the dated issue comment as a call.

- **A named file moved on main before the first commit** (`git diff --stat 36e67efe origin/main -- <the seven edited files under Files>`), or one of the four new paths exists on main: re-apply the diffs by their context, or rename a colliding new file with a `-lane-b` suffix, and re-run commit 1's red count and the mutations.
- **Commit 1 does not read 16 failing, 0 passing**, or a red is not an `AssertionError`: the stub differs from `stub.diff`; make it match.
- **A local suite run times out on a wait this plan added** (`settle timeout BR1c ...`, `BR6 ...`, `RR22 ...`, `RR37 ...`, `RH10 ...`), read its last read in the message:
  - `BR1c the legend row at rest at 1280` with `moving: true` throughout: something on `.legend` runs forever; compare only the `left` transition (`getAnimations().some((a) => a.playState === "running" && a.transitionProperty === "left")`) and say so.
  - `BR1c the room laid out at ...` or `BR6 the room laid out at 1024x700`, or `RR37 the room laid out again at 1440x900`, with the window at the new size and the sheet unchanged: the sheet did not move at that size; depart on the window and a resize counted after the room's own listener instead (`COUNT_RESIZES`'s form in `e2e/suites/zoom/resets.ts`, copied into the suite, not imported).
  - `BR1c the room laid out again after the override` with `h` still 800: the clear did not land; send the clear once more before the wait, as `clearMetrics` in `e2e/suites/print-room/kit.ts` waits.
  - `BR6 the tap's click` with `n` unchanged: the tap fires no click on this browser; count `pointerup` instead of `click` and keep the window.
  - `RR22 the sweep under way` with `u` unchanged: the room parked somewhere Play does not restart from; depart on `playing` read from the same object, and note that it sits beside the claim's label.
  - `RH10 the Gallery's plates landed` with `anims` empty or `null`: the grid carries no animation in this build; depart on the poll's own `loaded` and `y` and drop `animated`.
- **A local run reds a check this plan touches without a timeout** (BR1c, BR5, BR6, PB7d, RR18, RR19, RR22, RR31, RR35, RR37, RR36, RR39, RH10): for a deleted pause (BR5, PB7d, RR18, RR31, RR35, RR37's range move), put a `makeStable` wait in its place whose departure is the action's own visible effect and not the claim, step the check if the lint asks, and record that the deletion's premise failed; anything else reds as any red does.
- **`npm run lint` reports `max-lines-per-function` or `max-lines`** in a touched file: split the function along the plan's own seams (the payloads and predicates to module scope, as `broadside.ts` already does).
- **The guard prover reports any of M1 to M29 as a hole, or proof-runner row P1 does not red BR6**: a hole is deleted or strengthened as Gate 1 says; P1 green means the window no longer catches the navigation, and the window goes back to starting at `touchEnd` (the click wait after it, not before).
- **The pull request's first CI run reds lane B on a check named above**: it follows `.claude/agents/vellum-implementer.md`'s red-on-CI route and the triage the dispatcher owes Alex; it is not a reason to lengthen a budget unread.
