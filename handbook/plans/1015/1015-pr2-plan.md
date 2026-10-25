# Issue #1015, pull request 2 (`pr2`, called `silentAB` in the first plan): the three waits in lanes A and B that can pass silently, and the seven hand-wrapped settles there, onto `makeSettle`

**Planned at**: `origin/main` dee4064c878369d350a3638d921b55fca1d253dc, with the issue's comment count at 4 (the two rulings, the first plan's archive, the first pull request's calls). The planning tree was made at 1c9139fa; `git diff --stat 1c9139fa origin/main` is one line added to `.claude/skills/vellum-footguns/references/flake-record.md`, so every code reading below holds at dee4064c.

**Rulings**:
- https://github.com/ahl-gram/Vellum/issues/1015#issuecomment-6391964526 (Alex, 2026-10-24: pull request 1 is the tolerant wait helper plus the Prospect and Ribbon kits; the later pull requests' number and shape are the planner's to state).
- https://github.com/ahl-gram/Vellum/issues/1015#issuecomment-6392355188 (Alex, 2026-10-24: "Option 1: only the loops that can pass silently (Recommended)": the loops that can let a test carry on as if the page were ready, plus moving the hand-rolled error-hiding places onto the helper, in two more pull requests; the loops that already end in a check that fails visibly stay as they are; no lint rule).
- This pull request's own rulings: none yet (the STOP below).

**Archive path**: `handbook/plans/1015/1015-pr2-plan.md`, beside `handbook/plans/1015/1015-plan.md`, which stays frozen as pull request 1 left it. A revision of this plan after a hand-back is committed beside it as its own file, never over it (Issue #1060, Alex, 2026-10-25).

**Open decisions**: none. The plan still STOPs, so Alex sees the calls made before anything is built.

## Specs

Read these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: clause 4 whole, and its sentence on `tolerant: true` ("A wait being written whose read can throw before the page answers, across a navigation, a boot or a hop, passes `tolerant: true`"), which is the rule this plan applies site by site; clause 6; the environment bullet "The harness serves the BUILT site"; and "Where the Mac and the CI runner disagree", its Speed bullet.
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code; it never searches source text), "The lint", and "The browser lanes and a plate read" (the two readings a plan prints).
- `handbook/specs/conventions.md`: "How code is cited" (the two dated lines below cite `glideMs` in `src/site/prospect/seats.ts`, `REDRAFT_TRIES` in `e2e/suites/zoom/kit.ts`, `ceremonySkip` in `src/site/home/veil.ts` and `LANDFALL_HOLD_MS` in `src/site/home/ceremony.ts`, each in the form `vellum/ts-comment-citation-resolves` checks).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 2, 3, 5, 6 and 9 before the tests; Gate 2 items 6, 7, 8 and 16 before touching a wait; Gate 5 at the push.

## What the tree says (recon and the caller read, 2026-10-25)

`vellum-spec-recon` ran on this pull request against 1c9139fa; its ledger and this plan's own reading agree on every point below.

- **The scans, re-run.** `node out/1015-dry-run/p1015pr2-loop-scan.ts <tree>` (the first plan's `loop-scan.ts`, copied) finds **104 swallowing poll loops in 36 files** (108 in 38 at the first plan's base, less the four the first pull request converted). `p1015pr2-loop-assert.ts`: 74 asserted, 20 handed to a caller, 6 never looked at, 4 only branched on. `p1015pr2-loop-unstepped.ts`: 88 of 104 reached outside every step. That last scan **errs toward "in a step"**: it does not follow a helper reached through a kit's shorthand property whose value is a function declaration or a destructured binding (`orderPng` in `e2e/suites/print-room/kit.ts`, `plateShown` in `e2e/suites/reading-room/kit.ts`), so the first plan's "in a step: yes" for those two is STALE; both are reached outside every step, and 13 of the 15 loops below are, not 11. Its column is not quoted for any decision here.
- **The 15 loops the first plan listed for this pull request are where it said**, line and function, in lanes A and B (`E2E_LANES` in `e2e/support/lanes.ts`). Reading every caller, **3 can pass silently and 12 cannot**:

| loop | function | what its caller does with the answer | verdict |
|---|---|---|---|
| `e2e/suites/print-room/kit.ts:14` | `orderPng` | PR17, PR18, PR19 in `pr17Png` assert `!!pngN && ...` | loud, stays |
| `e2e/suites/print-room/atlas.ts:33` | `pr20Bound` | PR20, PR20d, PR20c assert `!!bound && ...` | loud, stays |
| `e2e/suites/print-room/plates.ts:36` | `pr13Poster` | PR13 and PR14 assert `!!poster && ...` | loud, stays |
| `e2e/suites/print-room/redraw.ts:70` | `pr24cRebound` | PR24c asserts `!!rebound && rebound.loaded && rebound.turnedLoaded` | loud, stays |
| `e2e/suites/print-room/link.ts:6` | `prlLink` | gives up to `orderHref = null`, and PRL asserts `!!orderHref` | loud, stays |
| `e2e/suites/print-room/link.ts:67` | `prwWarp` | gives up to `warpHref = null`, and PRW asserts `!!warpHref` | loud, stays |
| `e2e/suites/prospect.ts:44` | `pb1WayIn` | gives up to `href = null`, and PB1 and PB1b assert `!!href`, `!!href1` | loud, stays |
| `e2e/suites/prospect.ts:177` | `pb3fGlassLeans`, its second loop | nothing reads whether the Glass came home after `0`; the checks after it read a sheet that may still be leaned | **silent, converted** |
| `e2e/suites/ribbon.ts:106` | `rb5cLeans`, its second loop | the same | **silent, converted** |
| `e2e/suites/reading-room/kit.ts:19` | `plateShown` | RR32, RR27, RR27b, RR29, RR28b assert `!!plate && ...` | loud, stays |
| `e2e/suites/reading-room/kit.ts:42` | `boot` | RR0, RR6a, RR7a, RR23a, RR24, RR11b take the boolean; RR9 gates on it and asserts `!!bare` | loud, stays (and `rr0Boots` over a stand-in page in `test/repo/e2e-tiers.test.ts` pins it returning false; a throwing `boot` would red that test) |
| `e2e/suites/reading-room/kit.ts:54` | `settled` | RR2, RR6a, RR7a, RR24, RR25, RR11b take the boolean | loud, stays |
| `e2e/suites/reading-room/kit.ts:70` | `plateStaysHidden` | a negative dwell: `null` after the whole window is the PASS of RR26 and RR28, and a throwing read returns `{ missing: true }`, which reds them | loud, stays (a settle would invert its meaning) |
| `e2e/suites/runninghead/kit.ts:9` | `visit`, its first loop | returns `false`; callers throw "never loaded" (RH12, RH13, RH14, RH17, RH30, RH31), list the route as unreachable (RH0), or gate a later `!!` assertion (RH7, RH10, RH10c, RH25) | loud, stays |
| `e2e/suites/runninghead/kit.ts:20` | `visit`, its veil loop | presses Escape until `#lf-veil` goes, then returns `true` whether it went or not | **silent, converted** |

- **The seven hand-wrapped calls are where the first plan said**, each `makeSettle({ evaluate: (e: string) => evaluate<X | null>(e).catch(() => null), sleep })` or its `ctx.` form, and each already inside a step: `pr36Authored` in `e2e/suites/print-room/room.ts` (step PR36), `pr40RunnerLayout` in `e2e/suites/print-room/runner-layout.ts` (PR40), `br9Authored` in `e2e/suites/broadside/room.ts` (BR9), `pb16ScriptsOff` (PB16) and `backHome`'s two (PB18) in `e2e/suites/prospect/room.ts`, `rr38Authored` in `e2e/suites/reading-room/room.ts` (RR38). The nine of pull request 3 are in `e2e/suites/chart-drawer/` (2 in `homes.ts`, 4 in `portfolio.ts`, 3 in `room.ts`).
- **No step this touches is skipped**: `E2E_SKIPS` in `e2e/support/skips.ts` names RS30, CD25/CD26/CD30, FL1, EA7 and EA8 only.
- **Selection**: `NEEDS_PREDECESSOR` in `e2e/support/suites.ts` makes `print-room` follow `hunt`; `runninghead` is in `OPENS_ON_HOME`, which only matters directly after `home`, and the harness opens on `/explorer/` (`e2e/support/runner.ts`).
- **Where this meets other issues.** Issue #785 sub 3 (comment 6384402685) puts RB5c first, and RB5c's helper is `rb5cLeans` in `e2e/suites/ribbon.ts`, whose second half and signature this pull request edits; its first loop (the measurement RB5c asserts) is #785's and is not touched here. Issue #1016 shares the kits' `goto` copies; `glassHome` lands beside `goto` in `e2e/suites/prospect/kit.ts` and `e2e/suites/ribbon/kit.ts`. Nothing else in #785's lists (BR1c and BR2 in `e2e/suites/broadside.ts`, RR35 and RR37 under `e2e/suites/reading-room/`, the `sleep(200)` in `e2e/suites/reading-room.ts`) is in a file this pull request edits.

## The design

**Three silent waits made loud, each in the form its site allows, and seven hand-wrapped settles made tolerant.**

1. **The Glass's way home, in the Prospect and the Ribbon, becomes a kit wait, `glassHome`, that throws.** Each kit gains `glassHome(): Promise<void>` beside `goto` and `opened`: it presses `0` on `#map-viewport` exactly as the suites do today, then waits with `makeSettle({ evaluate, sleep })` (strict, the default) for `!#map-viewport.classList.contains("zoomed")`, `GLASS_HOME_TRIES` = 60 reads (the loop's own budget), labelled `prospect-glass-home` or `ribbon-glass-home`. `pb3fGlassLeans` in `e2e/suites/prospect.ts` and `rb5cLeans` in `e2e/suites/ribbon.ts` replace their press and loop with `await glassHome()`. Both run inside a step ("PB2 to PB5", "RB1 to RB5e"), so a Glass that never comes home fails that step by name with `settle timeout <room>-glass-home: false` instead of handing the later checks a leaned sheet.
   - **Strict, not tolerant.** Nothing navigates while the Glass comes home: it is a key press on the same document, the read throws only if `#map-viewport` is gone, which is a defect to fail on at once with its own error. That is clause 4's sentence read site by site (tolerant for a read that can throw across a navigation, a boot or a hop; this crosses none) and the first plan's own interface ("A read that must never throw keeps the default and fails fast"). Measured: 0 throws in every read of the probe below. The first plan's sketch said every silent loop takes `tolerant: true`; this departs from it, and Calls made says so.
2. **The running head's veil loop stays a loop, and its answer becomes visit's.** It presses Escape and sleeps 150 ms between reads, so it is not a settle (`makeSettle` has no action between reads), and it is reached outside every step by `rhSweep` from `run` in `e2e/suites/runninghead.ts`, so it must not throw: a throwing `visit` reds `vellum/e2e-throw-inside-step` at four calls in that file (the control below). So `if (!up) break;` becomes `if (!up) return true;`, the `return true;` after the loop becomes `return false;`, and the literal 40 becomes `VEIL_PRESSES` with its dated line. A veil that never lifts now answers `false`, which every caller already turns into a visible failure: RH0 lists `/` as unreachable, and RH13 throws "RH13: home never loaded" inside its step. The loop's reads, presses, cadence and `catch {}` are unchanged; only its two exits are edited, which is why clause 4's sentence for a wait being written is answered here by the non-throwing contract rather than by `tolerant: true`.
3. **The seven hand-wrapped calls become `makeSettle({ evaluate, sleep, tolerant: true })`** (`makeSettle({ evaluate: ctx.evaluate, sleep: ctx.sleep, tolerant: true })` in `pr40RunnerLayout`). Every one waits across a scripts-off reload or a hop, so clause 4's sentence asks for tolerant. The read, the predicate, the label and the budget at each call are unchanged. A tolerant settle treats a throwing read exactly as `.catch(() => null)` did (a null read, the previous read forgotten; S1, S3 and S4 in `test/repo/e2e-read-types.test.ts` pin that), so the only change is the timeout's text, which now ends ` (the last read threw: <error>)` when the last read threw.

**Rejected alternatives** (do not rediscover these mid-build):

- **Converting the 12 loud loops too.** That is the ruling's Option 2, not chosen (comment 6392355188); each already fails its check visibly when it gives up.
- **A tolerant `glassHome`, as the first plan sketched.** It would retry a read that throws only when the page is broken, burning 3 s before failing; clause 4 ties tolerance to navigation, and none happens here.
- **The Glass wait left in the suite files.** The suite functions would then need their own stub harness for every case; the kits already hold the rooms' waits (`goto`, `opened`), where `test/e2e/room-kit-waits.test.ts` drives them over `KITS`.
- **One shared `glassHome` in `e2e/support/`.** No third caller exists, and sharing the kits' helpers is Issue #1016's; each kit keeps its own copy, as each keeps its own `goto`.
- **The veil loop as a settle.** It presses a key before each read, which `makeSettle` cannot.
- **`visit` throwing on a stuck veil, or `rhSweep` moved into a step.** The first reds the throw lint four times in `e2e/suites/runninghead.ts`; the second changes how RH0 to RH9 report, which is not asked.
- **A lint holding hand-wrapped settles at zero.** Nine remain for pull request 3, and the ruling adds no lint.
- **Testing the seven sites by reading their source.** `handbook/specs/check-placement.md` (The unit suite) refuses a source-text test; the tests below run each site's function on a stubbed page instead.
- **Folding `backHome`'s `away` and `home` settles into one** now that they are identical: touch only what is asked.
- **Merging this pull request with pull request 3.** Recon offered it; the ruling fixed two pull requests, pull request 3's callers are unread, and its files (`e2e/support/room.ts`, `e2e/support/home.ts`, the specimen and landfall kits) are where Issues #1016 and #785 sub 2 meet it.

## Files

Code below is as `npm run format` leaves it: `prettier --check` passed over every staged file (Tests, "Checked while planning"). Commit 1's stubs are shown under Tests.

1. `handbook/plans/1015/1015-pr2-plan.md` (created): this plan, copied unchanged.
2. `e2e/suites/prospect/kit.ts` (edited): after `export const HOP_TRIES = 100;` add the dated line and `export const GLASS_HOME_TRIES = 60;`; after `opened` add `glassHome`; add `glassHome` to the returned object after `opened`.
3. `e2e/suites/ribbon/kit.ts` (edited): import `GLASS_HOME_TRIES` beside `HOP_TRIES`; after `opened` add `glassHome` (label `ribbon-glass-home`); add it to the returned object after `opened`.
4. `e2e/suites/prospect.ts` (edited): `export` on `pb3fGlassLeans`; `glassHome` added to its destructure and its `Pick`; its press and second loop become `await glassHome();`; `pb3eRoomAndPlate` destructures `glassHome` and passes it on.
5. `e2e/suites/ribbon.ts` (edited): the same for `rb5cLeans` and its caller `rb5bTheSlip`.
6. `e2e/suites/runninghead/kit.ts` (edited): `VEIL_PRESSES` with its dated line above `runningHeadKit`; the veil loop's two exits.
7. `e2e/suites/prospect/room.ts` (edited): `export` on `backHome`; its two settles and `pb16ScriptsOff`'s made tolerant.
8. `e2e/suites/print-room/room.ts`, `e2e/suites/print-room/runner-layout.ts`, `e2e/suites/broadside/room.ts`, `e2e/suites/reading-room/room.ts` (edited): one settle each made tolerant.
9. `test/e2e/room-kit-waits.test.ts` (edited) and `test/e2e/suite-waits.test.ts` (created): the tests, text under Tests.

The finished edits to the source files, as a unified diff against dee4064c (exactly what `out/1015-dry-run/p1015pr2-stage.ts planned` writes; the test file's diff is under Tests):

```diff
--- a/e2e/suites/prospect/kit.ts
+++ b/e2e/suites/prospect/kit.ts
@@ -40,6 +40,8 @@
 export const STORE = JSON.stringify(TABLE_STORE_KEY);
 // 2026-10-24: a hop to /faq/ read the plate gone on its first read in 10 of 10 hops across this kit and the Ribbon's (Page.navigate returns once the new document commits); 100 reads of 50 ms is a cap on a hang, a hundred times that.
 export const HOP_TRIES = 100;
+// 2026-10-25: the Glass read home 7 or 8 reads after 0 (309 to 361 ms: one glide, `glideMs` in `src/site/prospect/seats.ts`, and a read) in 10 of 10 presses across this kit and the Ribbon's; 60 reads of 50 ms, the loop's own budget and at least 3 s, keeps 2.5 times the slowest at CI's 3.3 (`REDRAFT_TRIES` in `e2e/suites/zoom/kit.ts`).
+export const GLASS_HOME_TRIES = 60;
 
 export function prospectKit(ctx: SuiteContext) {
   const { evaluate, send, sleep, PORT } = ctx;
@@ -56,6 +58,17 @@
   const state = () => evaluate(STATE);
   const opened = (label: string) =>
     settle(STATE, (s) => s.blob && s.status === "", `prospect page never drew: ${label}`, 300);
+  const glassHome = async (): Promise<void> => {
+    await evaluate(
+      `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`,
+    );
+    await makeSettle({ evaluate, sleep })<boolean>(
+      `!document.getElementById("map-viewport").classList.contains("zoomed")`,
+      (home) => home,
+      "prospect-glass-home",
+      GLASS_HOME_TRIES,
+    );
+  };
   const svgOf = () => evaluate<string>(`fetch(document.getElementById("pp-plate").src).then(r=>r.text())`, true);
   const moveTo = async (x: number, y: number): Promise<void> => {
     await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
@@ -68,7 +81,7 @@
       await evaluate(`localStorage.removeItem(${STORE})`);
     } catch {}
   };
-  return { ...ctx, page, goto, state, opened, svgOf, moveTo, pressAt, parkMouse, forget };
+  return { ...ctx, page, goto, state, opened, glassHome, svgOf, moveTo, pressAt, parkMouse, forget };
 }
 
 export async function axName({ send }: Pick<SuiteContext, "send">, selector: string): Promise<string | null> {
--- a/e2e/suites/ribbon/kit.ts
+++ b/e2e/suites/ribbon/kit.ts
@@ -1,7 +1,7 @@
 // The Ribbon suite's kit: the room's address, its state read and the scroll's arrival.
 import type { Payload, SuiteContext } from "../../types.ts";
 import { makeSettle } from "../../support/settle.ts";
-import { HOP_TRIES } from "../prospect/kit.ts";
+import { GLASS_HOME_TRIES, HOP_TRIES } from "../prospect/kit.ts";
 
 export type Ribbon = {
   seed: number;
@@ -44,6 +44,17 @@
   const state = () => evaluate(STATE);
   const opened = (label: string) =>
     settle(STATE, (s) => s.blob && s.status === "", `ribbon page never drew: ${label}`, 300);
+  const glassHome = async (): Promise<void> => {
+    await evaluate(
+      `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`,
+    );
+    await makeSettle({ evaluate, sleep })<boolean>(
+      `!document.getElementById("map-viewport").classList.contains("zoomed")`,
+      (home) => home,
+      "ribbon-glass-home",
+      GLASS_HOME_TRIES,
+    );
+  };
   const svgOf = () => evaluate<string>(`fetch(document.getElementById("rb-plate").src).then(r=>r.text())`, true);
-  return { ...ctx, page, goto, state, opened, svgOf };
+  return { ...ctx, page, goto, state, opened, glassHome, svgOf };
 }
--- a/e2e/suites/prospect.ts
+++ b/e2e/suites/prospect.ts
@@ -148,11 +148,12 @@
   );
 }
 
-async function pb3fGlassLeans({
+export async function pb3fGlassLeans({
   evaluate,
   check,
   sleep,
-}: Pick<ProspectKit, "evaluate" | "check" | "sleep">): Promise<void> {
+  glassHome,
+}: Pick<ProspectKit, "evaluate" | "check" | "sleep" | "glassHome">): Promise<void> {
   await evaluate(
     `(()=>{const vp=document.getElementById("map-viewport");vp.focus();vp.dispatchEvent(new KeyboardEvent("keydown",{key:"+",bubbles:true}));})()`,
   );
@@ -171,20 +172,10 @@
     !!leaned && leaned.zoomed && leaned.k > 1.3,
     JSON.stringify(leaned),
   );
-  await evaluate(
-    `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`,
-  );
-  for (let i = 0; i < 60; i++) {
-    let home = null;
-    try {
-      home = await evaluate<boolean>(`!document.getElementById("map-viewport").classList.contains("zoomed")`);
-    } catch {}
-    if (home) break;
-    await sleep(50);
-  }
+  await glassHome();
 }
 
-async function pb3eRoomAndPlate({ evaluate, check, sleep, svgOf }: ProspectKit): Promise<string> {
+async function pb3eRoomAndPlate({ evaluate, check, sleep, svgOf, glassHome }: ProspectKit): Promise<string> {
   const room = await evaluate<{
     chartRoom: boolean;
     footer: boolean;
@@ -208,7 +199,7 @@
       Math.abs(room.ph - room.h) < 1,
     JSON.stringify(room),
   );
-  await pb3fGlassLeans({ evaluate, check, sleep });
+  await pb3fGlassLeans({ evaluate, check, sleep, glassHome });
   check(
     "PB4 the render worker serves the page (no silent inline fallback)",
     await evaluate<boolean>(`window.__vellumProspectUsesWorker() === true`),
--- a/e2e/suites/ribbon.ts
+++ b/e2e/suites/ribbon.ts
@@ -70,7 +70,12 @@
   return svg1;
 }
 
-async function rb5cLeans({ evaluate, check, sleep }: Pick<RibbonKit, "evaluate" | "check" | "sleep">): Promise<void> {
+export async function rb5cLeans({
+  evaluate,
+  check,
+  sleep,
+  glassHome,
+}: Pick<RibbonKit, "evaluate" | "check" | "sleep" | "glassHome">): Promise<void> {
   await evaluate(`document.querySelectorAll("#rb-itinerary li .lean")[2].click()`);
   let leaned = null;
   for (let i = 0; i < 60; i++) {
@@ -100,17 +105,7 @@
       Math.abs(leaned.cy - leaned.ny) < 1e-3,
     JSON.stringify(leaned),
   );
-  await evaluate(
-    `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`,
-  );
-  for (let i = 0; i < 60; i++) {
-    let home = null;
-    try {
-      home = await evaluate<boolean>(`!document.getElementById("map-viewport").classList.contains("zoomed")`);
-    } catch {}
-    if (home) break;
-    await sleep(50);
-  }
+  await glassHome();
 }
 
 function rb5dRoadsOut({ check }: Pick<RibbonKit, "check">, first: Ribbon): void {
@@ -129,7 +124,7 @@
   );
 }
 
-async function rb5bTheSlip({ evaluate, check, sleep }: RibbonKit, first: Ribbon): Promise<void> {
+async function rb5bTheSlip({ evaluate, check, sleep, glassHome }: RibbonKit, first: Ribbon): Promise<void> {
   const rows = await evaluate<{ first: Row | null; last: Row | null; buttons: boolean }>(
     `(()=>{const lis=[...document.querySelectorAll("#rb-itinerary li")];const read=(li)=>({cls:li.className,num:(li.querySelector(".cr-num")||{}).textContent,strong:(li.querySelector("strong")||{}).textContent||null,em:(li.querySelector("em")||{}).textContent||null,button:!!li.querySelector("button.lean")});return{first:lis.length?read(lis[0]):null,last:lis.length?read(lis[lis.length-1]):null,buttons:lis.every((li)=>!!li.querySelector("button.lean"))};})()`,
   );
@@ -163,7 +158,7 @@
     first.fromOptions.length === 25 && !first.fromOptions.includes(24) && first.fromOptions.includes(0),
     JSON.stringify({ count: first.fromOptions.length, has24: first.fromOptions.includes(24) }),
   );
-  await rb5cLeans({ evaluate, check, sleep });
+  await rb5cLeans({ evaluate, check, sleep, glassHome });
   rb5dRoadsOut({ check }, first);
 }
 
--- a/e2e/suites/runninghead/kit.ts
+++ b/e2e/suites/runninghead/kit.ts
@@ -2,6 +2,9 @@
 
 export type RunningHeadKit = ReturnType<typeof runningHeadKit>;
 
+// 2026-10-25: on 5 of 5 first arrivals the veil was up before the first press and gone at the read after it, since a key lifts it once armed (`ceremonySkip` in `src/site/home/veil.ts`), and unpressed it lifts itself about 4 s into its ceremony (`LANDFALL_HOLD_MS` in `src/site/home/ceremony.ts`, with the gate before it and the 1.1 s lift after); 40 presses hold 6 s of sleeps alone and only lengthen on a slower runner, so a veil still up after them is one the page never lifts.
+const VEIL_PRESSES = 40;
+
 export function runningHeadKit(ctx: SuiteContext) {
   const { evaluate, send, sleep, PORT } = ctx;
   const visit = async (route: string): Promise<boolean> => {
@@ -17,7 +20,7 @@
     }
     if (route !== "/") return true;
     // Home's first arrival raises the ceremony veil (Issue #457); a key before the module arms the skip hits nothing, so press until the veil goes and the cluster shows on the stage.
-    for (let i = 0; i < 40; i++) {
+    for (let i = 0; i < VEIL_PRESSES; i++) {
       await send("Input.dispatchKeyEvent", {
         type: "keyDown",
         key: "Escape",
@@ -30,9 +33,9 @@
       try {
         up = await evaluate<boolean>(`!!document.getElementById("lf-veil")`);
       } catch {}
-      if (!up) break;
+      if (!up) return true;
     }
-    return true;
+    return false;
   };
   return { ...ctx, visit };
 }
--- a/e2e/suites/prospect/room.ts
+++ b/e2e/suites/prospect/room.ts
@@ -173,7 +173,7 @@
   const { evaluate, send, check, sleep, page } = k;
   const control = await evaluate(OFF);
   type Loaded = { ready: string; lay: boolean };
-  const settle = makeSettle({ evaluate: (e: string) => evaluate<Loaded | null>(e).catch(() => null), sleep });
+  const settle = makeSettle({ evaluate, sleep, tolerant: true });
   const off = await withScriptsOff(send, async () => {
     await send("Page.navigate", { url: "about:blank" });
     await send("Page.navigate", { url: page("#seed=42&i=0") });
@@ -267,14 +267,14 @@
   return { path: location.pathname, marker: window.__pb18 ?? null, nav: performance.getEntriesByType("navigation")[0] && performance.getEntriesByType("navigation")[0].type,
     table: new URLSearchParams(location.hash.slice(1)).get("table"), count: (document.getElementById("pp-lay-count") || {}).textContent ?? null, dim: !!p && p.classList.contains("dim"), drawn: !!st }; })()`;
 
-async function backHome(k: ProspectKit, marker: string, unload: boolean): Promise<Home> {
+export async function backHome(k: ProspectKit, marker: string, unload: boolean): Promise<Home> {
   const { evaluate, sleep } = k;
   await evaluate(
     `(() => { window.__pb18 = "${marker}"; ${unload ? `window.addEventListener("unload", () => {});` : ""} setTimeout(() => { location.href = "/faq/"; }, 0); return true; })()`,
   );
   type Away = { path: string; ready: string };
-  const away = makeSettle({ evaluate: (e: string) => evaluate<Away | null>(e).catch(() => null), sleep });
-  const home = makeSettle({ evaluate: (e: string) => evaluate<Home | null>(e).catch(() => null), sleep });
+  const away = makeSettle({ evaluate, sleep, tolerant: true });
+  const home = makeSettle({ evaluate, sleep, tolerant: true });
   await away<Away>(
     `({ path: location.pathname, ready: document.readyState })`,
     (d) => d.path === "/faq/" && d.ready === "complete",
--- a/e2e/suites/print-room/room.ts
+++ b/e2e/suites/print-room/room.ts
@@ -190,10 +190,7 @@
   `(() => { const n = document.querySelector(".stage noscript .status"); return { ready: document.readyState, w: n ? n.getBoundingClientRect().width : 0 }; })()`;
 
 export async function pr36Authored({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
-  const settle = makeSettle({
-    evaluate: (e: string) => evaluate<{ ready: string; w: number } | null>(e).catch(() => null),
-    sleep,
-  });
+  const settle = makeSettle({ evaluate, sleep, tolerant: true });
   const read = await withScriptsOff(send, async () => {
     await send("Page.navigate", { url: "about:blank" });
     await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/` });
--- a/e2e/suites/print-room/runner-layout.ts
+++ b/e2e/suites/print-room/runner-layout.ts
@@ -55,10 +55,7 @@
 }
 
 export async function pr40RunnerLayout(ctx: SuiteContext): Promise<void> {
-  const settle = makeSettle({
-    evaluate: (e: string) => ctx.evaluate<Staged | null>(e).catch(() => null),
-    sleep: ctx.sleep,
-  });
+  const settle = makeSettle({ evaluate: ctx.evaluate, sleep: ctx.sleep, tolerant: true });
   const { identifier } = await ctx.send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
     source: SENTINEL_SCRIPT,
   });
--- a/e2e/suites/broadside/room.ts
+++ b/e2e/suites/broadside/room.ts
@@ -172,7 +172,7 @@
 const NOTICE: Payload<Notice> = `(() => { const n = document.querySelector(".stage noscript .status"); return { ready: document.readyState, w: n ? n.getBoundingClientRect().width : 0 }; })()`;
 
 export async function br9Authored({ evaluate, send, check, sleep, PORT }: BroadsideKit): Promise<void> {
-  const settle = makeSettle({ evaluate: (e: string) => evaluate<Notice | null>(e).catch(() => null), sleep });
+  const settle = makeSettle({ evaluate, sleep, tolerant: true });
   try {
     const read = await withScriptsOff(send, async (): Promise<Authored> => {
       await send("Page.navigate", { url: "about:blank" });
--- a/e2e/suites/reading-room/room.ts
+++ b/e2e/suites/reading-room/room.ts
@@ -90,7 +90,7 @@
 const LOADED: Payload<Loaded> = `({ ready: document.readyState, path: location.pathname, frame: !!document.querySelector(".rf") })`;
 
 export async function rr38Authored({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
-  const settle = makeSettle({ evaluate: (e: string) => evaluate<Loaded | null>(e).catch(() => null), sleep });
+  const settle = makeSettle({ evaluate, sleep, tolerant: true });
   try {
     const read = await withScriptsOff(send, async () => {
       await send("Page.navigate", { url: "about:blank" });
```

(The same diff, with the test file's, is `out/1015-dry-run/p1015pr2-planned.diff`; it and commit 1's `out/1015-dry-run/p1015pr2-stub.diff` both pass `git apply --check` on the tree, checked while planning.)

Nothing else in these files changes. Every type the removed wrappers named is still used (`Loaded` and `Away` by their settles' type arguments, `Notice` by `NOTICE`, `Staged` by `STAGED`). No file passes `max-lines` or a function `max-lines-per-function` (400 and 50, blank lines and comments skipped, `eslint.config.ts`): the lint passed over every staged file. `e2e/suites/prospect.ts` is 412 raw lines today and 403 after, inside `max-lines`, and shrinks, so it is not split here.

## Tests, in the order they are written

All eighteen go in the first commit, with the stubs below, before any implementation. In that commit, `npm test -- test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts` shows **14 red, each on its assertion**, and 12 green: the 8 existing kit tests, GH2 for both rooms, V2 and V3.

### The stubs of commit 1 (right shape, wrong behaviour)

- `e2e/suites/prospect/kit.ts`: `GLASS_HOME_TRIES` with its dated line exactly as in the finished diff, and `glassHome` added to the kit and its returned object, with **today's** body moved in unchanged (press, then a loop that swallows and falls through):

  ```ts
  const glassHome = async (): Promise<void> => {
    await evaluate(
      `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`,
    );
    for (let i = 0; i < GLASS_HOME_TRIES; i++) {
      let home = null;
      try {
        home = await evaluate<boolean>(`!document.getElementById("map-viewport").classList.contains("zoomed")`);
      } catch {}
      if (home) break;
      await sleep(50);
    }
  };
  ```

- `e2e/suites/ribbon/kit.ts`: the same body, the `GLASS_HOME_TRIES` import, and `glassHome` in its returned object.
- `export` on `pb3fGlassLeans` in `e2e/suites/prospect.ts`, `rb5cLeans` in `e2e/suites/ribbon.ts` and `backHome` in `e2e/suites/prospect/room.ts`; nothing else in those files yet.

The whole stub is `out/1015-dry-run/p1015pr2-stub.diff`.

### In `test/e2e/room-kit-waits.test.ts` (edited)

The finished file differs from today's only by this diff (the four existing tests per room are unchanged):

```diff
@@ -2,35 +2,43 @@
 import assert from "node:assert/strict";
 import { prospectKit } from "../../e2e/suites/prospect/kit.ts";
 import { ribbonKit } from "../../e2e/suites/ribbon/kit.ts";
+import { runningHeadKit } from "../../e2e/suites/runninghead/kit.ts";
 import type { SuiteContext } from "../../e2e/types.ts";
 
 const PORT = 8765;
 const KITS = [
-  { room: "prospect", kit: prospectKit, hop: "prospect-goto-away", plate: "pp-plate" },
-  { room: "ribbon", kit: ribbonKit, hop: "ribbon-goto-away", plate: "rb-plate" },
+  { room: "prospect", kit: prospectKit, hop: "prospect-goto-away", plate: "pp-plate", glass: "prospect-glass-home" },
+  { room: "ribbon", kit: ribbonKit, hop: "ribbon-goto-away", plate: "rb-plate", glass: "ribbon-glass-home" },
 ] as const;
+const PRESS_ZERO = `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`;
+const GLASS_HOME = `!document.getElementById("map-viewport").classList.contains("zoomed")`;
+const VEIL = `!!document.getElementById("lf-veil")`;
 
-function page(answer: (nth: number) => unknown) {
+function page(answer: (nth: number, expression: string) => unknown) {
   const asked: string[] = [];
   const navigated: string[] = [];
+  const keys: string[] = [];
   const ctx = {
     evaluate: (expression: string): Promise<unknown> => {
       asked.push(expression);
-      const a = answer(asked.length);
+      const a = answer(asked.length, expression);
       return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
     },
     send: (method: string, params?: Record<string, unknown>): Promise<unknown> => {
       const url = params?.["url"];
       if (method === "Page.navigate") navigated.push(typeof url === "string" ? url : "");
+      const key = params?.["key"];
+      if (method === "Input.dispatchKeyEvent" && params?.["type"] === "keyDown")
+        keys.push(typeof key === "string" ? key : "");
       return Promise.resolve({});
     },
     sleep: (): Promise<void> => Promise.resolve(),
     PORT,
   } as unknown as SuiteContext;
-  return { asked, navigated, ctx };
+  return { asked, navigated, keys, ctx };
 }
 
-for (const { room, kit, hop, plate } of KITS) {
+for (const { room, kit, hop, plate, glass } of KITS) {
   test(`the ${room} kit's goto THROWS, naming its hop, when the page never leaves the plate, and never sends the room's own address after it`, async () => {
     const p = page(() => false);
     await assert.rejects(kit(p.ctx).goto("#seed=42"), (err: Error) => err.message === `settle timeout ${hop}: false`);
@@ -71,4 +79,59 @@
     assert.equal(await kit(p.ctx).opened("slow"), drawn);
     assert.equal(p.asked.length, 4, "the draw gave up on a throwing read, or accepted a plate that was not drawn");
   });
+
+  test(`the ${room} kit's glassHome presses 0 and then THROWS, naming its wait, when the Glass never comes home`, async () => {
+    const p = page(() => false);
+    await assert.rejects(kit(p.ctx).glassHome(), (err: Error) => err.message === `settle timeout ${glass}: false`);
+    assert.equal(p.asked[0], PRESS_ZERO, "the wait read before it pressed 0, or pressed something else");
+    assert.equal(p.asked.length, 61, "the wait did not spend the 60 reads it is given");
+    assert.ok(
+      p.asked.slice(1).every((expression) => expression === GLASS_HOME),
+      `the wait read something other than the Glass's own zoomed class: ${p.asked[1]}`,
+    );
+  });
+
+  test(`the ${room} kit's glassHome hands back as soon as the Glass is home`, async () => {
+    const p = page((nth) => nth >= 4);
+    await kit(p.ctx).glassHome();
+    assert.equal(p.asked.length, 4, "the wait read on past the Glass coming home, or never waited for it");
+  });
+
+  test(`the ${room} kit's glassHome fails at once with a read's own error, since nothing navigates while the Glass comes home`, async () => {
+    const gone = new Error("eval exception: TypeError: Cannot read properties of null (reading 'classList')");
+    const p = page((nth) => (nth === 2 ? gone : true));
+    await assert.rejects(kit(p.ctx).glassHome(), (err: unknown) => err === gone);
+    assert.equal(p.asked.length, 2, "the wait read again after a read threw");
+  });
 }
+
+test("the running head's visit to home answers false when the veil never lifts, after its 40 presses of Escape", async () => {
+  const p = page(() => true);
+  assert.equal(await runningHeadKit(p.ctx).visit("/"), false);
+  assert.deepEqual(
+    p.keys,
+    Array.from({ length: 40 }, () => "Escape"),
+    "the visit did not press Escape 40 times",
+  );
+  assert.equal(
+    p.asked.filter((expression) => expression === VEIL).length,
+    40,
+    "the visit did not read the veil once after each press",
+  );
+});
+
+test("the running head's visit to home answers true once the veil lifts, and stops pressing", async () => {
+  let veil = 0;
+  const p = page((nth, expression) => (expression === VEIL ? ++veil < 3 : true));
+  assert.equal(await runningHeadKit(p.ctx).visit("/"), true);
+  assert.equal(p.keys.length, 3, "the visit pressed on after the veil lifted, or stopped before it did");
+});
+
+test("the running head's visit to home presses on past a read of the veil that throws", async () => {
+  let veil = 0;
+  const p = page((nth, expression) =>
+    expression === VEIL ? (++veil === 1 ? new Error("eval exception: TypeError: gone") : false) : true,
+  );
+  assert.equal(await runningHeadKit(p.ctx).visit("/"), true);
+  assert.equal(p.keys.length, 2, "a veil read that threw stopped the presses or was read as the veil lifting");
+});
```

- **GH1** (`glassHome presses 0 and then THROWS`, one per room; red on the stub: "Missing expected rejection", today's loop falls through).
- **GH2** (`glassHome hands back as soon as the Glass is home`, one per room; green on the stub by design, since today's loop exits on `true` too: it pins that the throwing wait is not vacuous).
- **GH3** (`glassHome fails at once with a read's own error`, one per room; red on the stub: "Missing expected rejection", today's `catch {}` reads on past the throw).
- **V1** (`visit to home answers false when the veil never lifts`; red on the stub: `actual: true, expected: false`).
- **V2** (`answers true once the veil lifts, and stops pressing`; green on the stub by design: today's `break` stops at the same press).
- **V3** (`presses on past a read of the veil that throws`; green on the stub by design: it pins that the loop keeps the tolerance it has, which this plan leaves in place).

The literals 61, 60 and 40 in the tests are deliberate, as `HOP_TRIES`'s 100 was in the first pull request: importing `GLASS_HOME_TRIES` would let the budget move with nothing red.

### In `test/e2e/suite-waits.test.ts` (created)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { broadsideKit } from "../../e2e/suites/broadside/kit.ts";
import { br9Authored } from "../../e2e/suites/broadside/room.ts";
import { pr36Authored } from "../../e2e/suites/print-room/room.ts";
import { pr40RunnerLayout } from "../../e2e/suites/print-room/runner-layout.ts";
import { pb3fGlassLeans } from "../../e2e/suites/prospect.ts";
import { prospectKit } from "../../e2e/suites/prospect/kit.ts";
import { backHome, pb16ScriptsOff } from "../../e2e/suites/prospect/room.ts";
import { rr38Authored } from "../../e2e/suites/reading-room/room.ts";
import { rb5cLeans } from "../../e2e/suites/ribbon.ts";
import { ROOMS } from "../../e2e/suites/slide-away/kit.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const GONE = "eval exception: TypeError: Cannot read properties of null (reading 'getBoundingClientRect')";
const AWAY = "({ path: location.pathname, ready: document.readyState })";

type Leaning = {
  evaluate: () => Promise<unknown>;
  check: (name: string, ok: unknown) => void;
  sleep: () => Promise<void>;
  glassHome: () => Promise<void>;
};
const LEANS = [
  {
    code: "PB3f",
    leaned: { zoomed: true, k: 1.4 },
    lean: (k: Leaning) => pb3fGlassLeans(k as unknown as Parameters<typeof pb3fGlassLeans>[0]),
  },
  {
    code: "RB5c",
    leaned: { zoomed: true, k: 2.6, on: 2, cx: 0.5, cy: 0.5, nx: 0.5, ny: 0.5 },
    lean: (k: Leaning) => rb5cLeans(k as unknown as Parameters<typeof rb5cLeans>[0]),
  },
] as const;

for (const { code, leaned, lean } of LEANS) {
  test(`${code} takes its leaning check, then sends the Glass home through its kit's glassHome and lets that wait's failure stand`, async () => {
    const checked: { code: string | undefined; ok: boolean }[] = [];
    const stuck = new Error("settle timeout glass-home: false");
    let sent = 0;
    const k: Leaning = {
      evaluate: () => Promise.resolve(leaned),
      check: (name, ok) => void checked.push({ code: name.split(" ")[0], ok: !!ok }),
      sleep: () => Promise.resolve(),
      glassHome: () => {
        sent++;
        return Promise.reject(stuck);
      },
    };
    await assert.rejects(lean(k), (err: unknown) => err === stuck);
    assert.equal(sent, 1, "the check did not send the Glass home through its kit, or sent it more than once");
    assert.deepEqual(
      checked,
      [{ code, ok: true }],
      "the leaning check was not taken, alone and passing, before the Glass went home",
    );
  });
}

const page = (answer: (expression: string) => unknown): SuiteContext =>
  ({
    evaluate: (expression: string): Promise<unknown> => {
      const a = answer(expression);
      return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
    },
    send: (): Promise<unknown> => Promise.resolve({}),
    sleep: (): Promise<void> => Promise.resolve(),
    check: (): void => undefined,
    PORT: 8765,
  }) as unknown as SuiteContext;

const throwsOn =
  (marker: string) =>
  (expression: string): unknown =>
    expression.includes(marker) ? new Error(GONE) : null;

type Site = {
  site: string;
  label: string;
  answer: (expression: string) => unknown;
  run: (ctx: SuiteContext) => Promise<unknown>;
};

const SITES: readonly Site[] = [
  { site: "PR36", label: "print-room-scripts-off", answer: throwsOn(".stage noscript .status"), run: pr36Authored },
  {
    site: "PR40",
    label: `PR40 ${ROOMS[0]!.id} staged`,
    answer: throwsOn("document.fonts.status"),
    run: pr40RunnerLayout,
  },
  {
    site: "BR9",
    label: "explorer-scripts-off",
    answer: throwsOn(".stage noscript .status"),
    run: (ctx) => br9Authored(broadsideKit(ctx)),
  },
  {
    site: "PB16",
    label: "prospect-scripts-off",
    answer: throwsOn('lay: !!document.getElementById("pp-lay")'),
    run: (ctx) => pb16ScriptsOff(prospectKit(ctx)),
  },
  {
    site: "PB18's hop to the Q & A",
    label: "prospect-to-faq",
    answer: throwsOn(AWAY),
    run: (ctx) => backHome(prospectKit(ctx), "warm", false),
  },
  {
    site: "PB18's Back",
    label: "prospect-back",
    answer: (expression) =>
      expression === AWAY ? { path: "/faq/", ready: "complete" } : throwsOn("marker: window.__pb18")(expression),
    run: (ctx) => backHome(prospectKit(ctx), "warm", false),
  },
  {
    site: "RR38",
    label: "reading-room-scripts-off",
    answer: throwsOn('frame: !!document.querySelector(".rf")'),
    run: rr38Authored,
  },
];

for (const { site, label, answer, run } of SITES) {
  test(`the settle in ${site} reads past a read that throws and, when every one does, times out naming that read's error`, async () => {
    await assert.rejects(
      run(page(answer)),
      (err: Error) => err.message === `settle timeout ${label}: null (the last read threw: ${GONE})`,
    );
  });
}
```

- **L1, L2** (`PB3f takes its leaning check, then sends the Glass home through its kit's glassHome ...`, `RB5c ...`; red on the stub: "Missing expected rejection", the suites' own loops still run and resolve). They pin each instance's use of the kit's wait: the leaning check is taken, passing, before the Glass goes home, and the wait's failure is not swallowed.
- **H1 to H7** (`the settle in <site> reads past a read that throws ...`; red on the stub: "The validation function is expected to return "true". Received false", with `actual: Error: settle timeout <label>: null`, the hand-wrapped form losing the error). Each stub page throws on its site's own read and answers `null` to every other, so a marker that missed its read would leave the message without the suffix and red the finished build too: the green run below is the witness that each marker reaches its read. `GONE` is the error class the FL1, FL2 and FL6 rows of `.claude/skills/vellum-footguns/references/flake-record.md` record.

### The mutations, by line, each run while planning (`node out/1015-dry-run/p1015pr2-mutate.ts`, log `out/1015-dry-run/p1015pr2-mutate.log`: 30 of 30 BITES, each red exactly the tests named, no other)

| mutation (one line, in the finished build) | reds |
|---|---|
| `e2e/suites/prospect/kit.ts`: `glassHome`'s settle closed with `).catch(() => undefined);` | GH1, GH3 (prospect) |
| the same file: the label `"prospect-glass-home"` changed | GH1 (prospect) |
| `GLASS_HOME_TRIES = 59` | GH1 (both rooms) |
| `makeSettle({ evaluate, sleep, tolerant: true })` in `glassHome` | GH3 (prospect) |
| the read's class `"zoomed"` misspelt `"zoom"` | GH1 (prospect) |
| the press's payload emptied to `document.getElementById("map-viewport")` | GH1 (prospect) |
| the predicate `(home) => home` inverted | GH2 (prospect) |
| `e2e/suites/ribbon/kit.ts`: `.catch(() => undefined)`; the label changed | GH1 and GH3, GH1 (ribbon) |
| `e2e/suites/prospect.ts`: `await glassHome();` made `void glassHome;`; made `await glassHome().catch(() => undefined);` | L1, L1 |
| `e2e/suites/ribbon.ts`: `await glassHome();` made `void glassHome;` | L2 |
| `e2e/suites/runninghead/kit.ts`: `return false;` back to `return true;` | V1 |
| `VEIL_PRESSES = 39` | V1 |
| `if (!up) return true;` back to `if (!up) break;` | V2, V3 |
| the `try { ... } catch {}` round the veil read removed | V3 |
| each of the seven sites given back its `.catch(() => null)` wrapper | that site's H row |
| each of the seven sites made strict (`tolerant: true` removed) | that site's H row |

**Existing tests and guards that pin what this changes** (each ran green over the staged build, below):
- `test/e2e/room-kit-waits.test.ts`: edited; its 8 existing tests (the kits' `goto` and `opened`) are unchanged and stay green on the stub and after.
- `test/repo/e2e-read-types.test.ts`: the shape scan over every edited e2e file, and S1, S3 and S4, which pin the tolerant behaviour the seven swaps rely on.
- `test/repo/e2e-steps.test.ts`: the throw lint's own fixtures, which the moved waits must not disturb.
- `test/repo/e2e-tiers.test.ts`: imports `rr0Boots`, `readingRoomKit` and `CTX_THROWING_WAITS`, none of which this changes.
- `test/repo/console-support.test.ts` and `test/site/sheet-height.test.ts`: the tree-wide e2e scanners.
- `vellum/e2e-throw-inside-step` (every `glassHome` call inside a step, `visit` not throwing) and `vellum/ts-comment-citation-resolves` (the two dated lines' citations), run by `npm run lint`.

**Which tests the prover owes**: all eighteen new ones (GH1, GH2, GH3 for each room, V1 to V3, L1, L2, H1 to H7), in one `vellum-guard-prover` round at step 11, with the mutations above, by line. Anything changed after that round is the implementer's to prove, as step 15 says.

**Checked while planning, on a scratch copy, no source touched** (`out/1015-dry-run/p1015pr2-tree/`, a `cp -R` of `src`, `e2e`, `test`, `test-support`, `scripts`, `.github`, `.claude/skills` and the root configs at 1c9139fa, into which `node out/1015-dry-run/p1015pr2-stage.ts stub|planned` writes the edited files from the untouched sources; the plan's tests live as `out/1015-dry-run/p1015pr2-tests/*.planned.ts` so no `node --test` collects them, and the copy itself was deleted before the hand-back so no test run in this tree or in the main checkout sweeps its 338 test files): on the stub, the two files ran 26 tests, 14 red on the assertions named above and 12 green (`out/1015-dry-run/p1015pr2-tests-stub.log`); on the finished build, 26 of 26 green (`p1015pr2-tests-planned.log`); `tsc --noEmit -p` over the copy exit 0 (`p1015pr2-tsc.log`); ESLint over every edited file and the suite files that call them (`runninghead.ts`, `print-room.ts`, `broadside.ts`, `reading-room.ts`) exit 0, which covers `vellum/e2e-throw-inside-step` and `vellum/ts-comment-citation-resolves`; `prettier --check` over every edited file passed; and `test/repo/e2e-read-types.test.ts` (the shape scan), `test/repo/e2e-steps.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/repo/console-support.test.ts`, `test/site/sheet-height.test.ts` and every `test/e2e/*.test.ts` ran 260 of 260 green under the source-read guard (`p1015pr2-related-tests.log`). Three controls, each in the same copy: `visit` made to throw on a stuck veil reds `vellum/e2e-throw-inside-step` at four calls in `e2e/suites/runninghead.ts` (`p1015pr2-lint-control.log`), an unstepped `await k.glassHome()` in the Prospect's `run` reds it once (`p1015pr2-lint-control2.log`), so the lint sees `glassHome` as a throwing wait and the planned calls sit inside steps; and the dated line's citation misspelt `glideMz` reds `vellum/ts-comment-citation-resolves`.

**What no test here guards, named**: the 12 loud loops still swallow a read that throws, so one that throws on every try fails its check reporting `null` rather than the error (they stay by ruling); nothing refuses a new hand-written swallowing loop (no lint, by ruling); the nine hand-wrapped settles of pull request 3. Outside the issue's scope, which the ruling set at the swallowing loops: the 142 poll loops the scan finds with no `try` at all, some of which end in a `break` and fall through on budget (`e2e/suites/cards/gestures.ts:62`, `e2e/suites/zoom/bands.ts:99`); whether any of them can pass silently was not read here. The suites' prose comment at `run` in `e2e/suites/print-room.ts` ("Every poll below swallows and retries") stays true: no print-room loop changes, and its two settles still retry.

### Browser readings

This pull request adds no browser `check`. It changes three waits inside existing checks, and their two readings were taken while planning on the site `npm run build` made in the planning tree from 1c9139fa (exit 0, `out/1015-dry-run/p1015pr2-build.log`), with the planned waits copied into the probe where the source does not carry them yet (the Glass wait runs the source's own strict `makeSettle`; the veil runs the source's own `visit`, whose reads and presses the plan leaves unchanged, so the planned answer is read off the same run).

- Probe: `out/1015-dry-run/p1015pr2-probe.ts`, run as `node out/1015-dry-run/p1015pr2-probe.ts > out/1015-dry-run/p1015pr2-probe.log 2>&1` (exit 0), local Brave, 2026-10-25. The dispatcher copies the folder to the main checkout's `out/1015-dry-run/` when it retires this tree; every file of this plan's carries the prefix `p1015pr2-`, so nothing of the first plan's is overwritten.
- **Glass, precondition**: the Glass leaned before `0` in every repeat (Prospect `k` 1.311 to 1.343 with `zoomed`; Ribbon `k` 2.6 with `zoomed`), so the wait starts from a sheet that is not home.
- **Glass, fixture** (press `0`, planned `glassHome`): passed in 10 of 10, after 7 or 8 reads (309 to 361 ms) of 60; the nearest to failing, the Prospect's repeats 1 and 4 and the Ribbon's repeats 1, 2 and 3 (8 reads, 361 ms each). 0 reads threw. Today's loop exits after 6 or 7 reads in the same presses. An earlier run of the probe, before it gained the same-load veil read below, gave the same range and was overwritten.
- **Glass, mutation** (an observer the probe installs puts `zoomed` back on `#map-viewport` whenever it goes): the planned wait threw `settle timeout prospect-glass-home: false` after 60 reads, 3085 ms, and `settle timeout ribbon-glass-home: false` after 60 reads, 3087 ms, 0 throws; none came nearer to passing (every read `false`). Today's loop under the same mutation: `{"exitAt":60,"home":false}`, 3087 ms and 3080 ms, and carries on: the silent fall-through, reproduced. Lifting the observer, the planned wait passed in 2 reads.
- **Veil, precondition**, read in the same load just before `visit`'s first press (`veilBeforeFirstPress` in the log): on a first arrival (session storage cleared) the veil was up in 5 of 5; with home already visited this session it was absent in 5 of 5, as the inline script in `src/pages/index.astro` raises it only on a first arrival, which is lane B's case (RR10 visits home first). The guard has its case only on a first arrival, the one Evidence's third run takes.
- **Veil, fixture**: `visit("/")` answered on its first veil read in 10 of 10, after one press, that read `false` each time (on the first arrivals, the press lifted a raised veil), 346 to 432 ms; planned answer `true`, today's `true`. None came nearer to failing.
- **Veil, mutation** (a script added for every new document keeps an `#lf-veil` in the page): 40 presses, 40 veil reads all holding it, 6279 ms (first arrival) and 6387 ms (home already visited): planned answer `false`, today's `true`, the silent pass reproduced.
- **The seven tolerant settles** take no reading: no check, read, predicate, label or budget changes, and a tolerant settle handles a throwing read exactly as the wrapper did (Design, item 3), so on any page their fixture reading is today's; the one difference, the timeout's text, is what H1 to H7 pin. The suites running green (Evidence) is their browser proof. **Whether any of their reads throws on CI is UNVERIFIABLE locally**; the FL1, FL2 and FL6 rows are the record that such reads do.

## Order of commits

Branch: `fix/1015-silent-waits-ab`. Each subject starts `#1015`; each message ends with the house trailer block (`CLAUDE.md`, Process). Push at the first commit.

1. `#1015 The pull request 2 plan, and the failing tests for the Glass's way home, the veil and the seven tolerant settles`: `handbook/plans/1015/1015-pr2-plan.md`; the stubs (Tests); `test/e2e/room-kit-waits.test.ts`; `test/e2e/suite-waits.test.ts`. Run `npm test -- test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts`: 14 red on the assertions named, 12 green. Paste the red lines in the PR body.
2. `#1015 The Prospect and Ribbon kits' glassHome throws when the Glass never comes home`: the two kits' `glassHome` bodies as in Files. GH1 and GH3 green for both rooms.
3. `#1015 PB3f and RB5c send the Glass home through their kit, so a Glass that stays leaned fails its step`: `e2e/suites/prospect.ts`, `e2e/suites/ribbon.ts`. L1 and L2 green.
4. `#1015 The running head's visit answers false when the veil never lifts`: `e2e/suites/runninghead/kit.ts`. V1 green.
5. `#1015 The seven hand-wrapped settles in lanes A and B take tolerant: true, so a timeout names the read's error`: `e2e/suites/prospect/room.ts`, `e2e/suites/print-room/room.ts`, `e2e/suites/print-room/runner-layout.ts`, `e2e/suites/broadside/room.ts`, `e2e/suites/reading-room/room.ts`. H1 to H7 green.

## Rosters and doctrine

- **No doctrine edit.** Clause 4's sentence already says which form each site takes (tolerant across a navigation, a boot or a hop; the default elsewhere), and this plan applies it; `vellum-footguns` Gate 2 item 6 points at clause 4 and is left as it is.
- **No roster joins.** `CTX_THROWING_WAITS` in `scripts/lint/e2e-steps.ts` already holds `settle`, and the lint follows `glassHome` into it (control above); no `eslint.config.ts` block, no `SOURCE_READS` entry (both test files import modules and read no source text), no suite list, no skip. A new `*.test.ts` under `test/e2e/` is collected by `npm test` as it stands.
- **The first plan stays frozen.** Its table for this pull request is superseded by this plan's reading (3 silent loops, not 15; 13 outside every step, not 11), named in the PR body with the difference.
- **Unchanged, checked**: `test/repo/e2e-tiers.test.ts` imports `rr0Boots` and `readingRoomKit`, whose `boot` this plan does not touch; `backHome` stays the function `.claude/skills/vellum-footguns/references/flake-record.md` cites by name; the `deliberately not stepped` comments at `run` in `e2e/suites/prospect.ts` and `e2e/suites/ribbon.ts` name checks this plan does not move (the prospect one's PB7c is already the PR #698 row in `handbook/errata/prose.md`, and this plan does not edit that line).

## Evidence

Run one at a time, and only while no other lane's suite is running.

1. `npm run check`, `npm run lint` (the proof that every `glassHome` call sits inside a step and that the citation resolves), `npm run format:check` (`npm run format` writes it).
2. `npm test -- test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts`, then `npm test`, then `npm run astro:generate` (the suite deletes `generated/`).
3. `npm run build`, then, with `ps aux | grep '[r]emote-debugging-port'` printing nothing, three serial runs, each after the last has finished: `VELLUM_E2E_SUITES=prospect,ribbon,broadside,reading-room,runninghead npm run test:e2e` (lane B's five touched suites, in lane order, so the running head visits a home RR10 has already visited); `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` (lane A's one, behind its `NEEDS_PREDECESSOR`); `VELLUM_E2E_SUITES=runninghead npm run test:e2e` (a first arrival, the case where the veil is raised and the planned answer is earned). Never the full local lanes.
4. `vellum-guard-prover` on the eighteen new tests (above). `vellum-plate-reader` is not owed: nothing here is an appearance.
5. Step 12's dated comment on the issue carries Calls made below, pointing at the rulings comments rather than restating them.

## Calls made

Each is the planner's, taken on the rule named, and goes into the implementer's step 12 comment.

1. **This pull request converts 3 of the 15 loops the first plan listed, and the 12 others stay.** Rule: ruling 6392355188 (Option 1 converts the loops that can let a test carry on as if the page were ready) and the first plan's own line ("One whose caller already asserts on it is loud and stays"); the table above gives each caller's check. Two of the twelve are also traps: a throwing `boot` reds `test/repo/e2e-tiers.test.ts`, and `plateStaysHidden` is a negative dwell a settle would invert.
2. **The Glass's way home is strict, not tolerant**, departing from the first plan's sketch for this pull request ("each taking `makeSettle({ evaluate, sleep, tolerant: true })`"). Rule: clause 4's sentence ties tolerance to a read that can throw across a navigation, a boot or a hop, and a key press on the same document is none; the first plan's interface keeps the default for "a read that must never throw"; 0 throws in every read the probe took.
3. **The Glass wait lives in each kit as `glassHome`**, beside `goto` and `opened`, with the press inside it, each kit its own copy, and `GLASS_HOME_TRIES` exported from the Prospect kit and imported by the Ribbon's, as `HOP_TRIES` is. Rule: the first pull request's placement of the rooms' waits; sharing across kits is Issue #1016's.
4. **`GLASS_HOME_TRIES` keeps the loop's 60 reads**, a failure bound for the first time, with one dated line. Rule: `CLAUDE.md`, Process, "A bound is derived", and Gate 2 item 8 (measured worst case times a runner factor): a principle gives it (the class goes when one glide lands, `glideMs` in `src/site/prospect/seats.ts`), the probe confirms it (7 or 8 reads, 361 ms at worst), and the slowest times CI's 3.3 (the dated factor at `REDRAFT_TRIES` in `e2e/suites/zoom/kit.ts`) is about 1.2 s against at least 3 s of reads, 2.5 times headroom (`handbook/specs/settle-doctrine.md`, Where the Mac and the CI runner disagree, Speed). It waits on one glide after one key press, which no suite's size or order moves.
5. **The veil loop keeps its reads, its presses and its `catch {}`, and only its exits change**, so `visit` answers `false` for a veil that never lifts, with `VEIL_PRESSES` named and dated. This is its own form, not the first plan's "left exactly as it is": the two exits are edited. Rule for keeping the swallow: `visit` is reached outside every step and must not throw (the lint control: four reds in `e2e/suites/runninghead.ts`), its veil read follows a boot, and the loop presses a key before each read, which `makeSettle` cannot. Rule for the bound: a key lifts the veil the moment its skip is armed (`ceremonySkip` in `src/site/home/veil.ts`), and unpressed it lifts itself about 4 s into its ceremony (`MIN_VEIL_MS` and `LANDFALL_HOLD_MS` in `src/site/home/ceremony.ts`, then the 1.1 s veil-lift); 40 presses hold 6 s of sleeps alone, and a slower runner only lengthens them, so the budget outlasts both. A third lifter, named with its direction: the inline script in `src/pages/index.astro` removes a veil no module adopted after 10 s, so on a runner where the 40 presses outlast 10 s a page whose module never armed would read as lifted and pass this wait (it errs toward passing, and only for a module that never ran; whether a later RH check would catch that page was not measured); on this Mac the presses take about 6.3 s and that case reads as stuck. Its cost, named: a stuck veil reports as RH0's "unreachable: /" or RH13's "home never loaded", not as a veil.
6. **`pb3fGlassLeans`, `rb5cLeans` and `backHome` are exported** for the tests. Rule: Gate 1 item 6 (guard each instance), on the precedent of `r0ToR4Worker` in `e2e/suites/render.ts`, which `test/repo/e2e-tiers.test.ts` imports.
7. **The seven sites are tested by running each site's own function on a stubbed page** whose matching read always throws. Rule: `handbook/specs/check-placement.md`, The unit suite (run the code; never search its source).
8. **The new test file is `test/e2e/suite-waits.test.ts`**, and the kits' new tests join `test/e2e/room-kit-waits.test.ts`. Rule: one home per subject (the kits' waits in the file that already tests them; the suites' own waits in a file named for them, where pull request 3's nine rows can join).
9. **`backHome` keeps its two settles, `away` and `home`**, though identical now. Rule: touch only what is asked.
10. **No comment is edited.** Rule: the print-room comment stays true, and the PB7c comment is already an errata row on a line this pull request does not touch.
11. **One pull request, no split.** Rule: three small waits and seven one-line swaps; one wait sits outside every step and keeps its non-throwing contract, so no check moves into a step and no suite reports differently.
12. **Recon's two other options are not put to Alex.** Converting the loud loops anyway is the ruling's Option 2, not chosen; merging with pull request 3 would reopen the ruling's two pull requests on no new premise, before pull request 3's callers are read.

## Open decisions

None.

## Stop conditions

Hand back, with the command and what it printed, if:

- `git diff --stat dee4064c origin/main -- e2e/suites/prospect.ts e2e/suites/ribbon.ts e2e/suites/prospect/kit.ts e2e/suites/ribbon/kit.ts e2e/suites/prospect/room.ts e2e/suites/runninghead/kit.ts e2e/suites/print-room/room.ts e2e/suites/print-room/runner-layout.ts e2e/suites/broadside/room.ts e2e/suites/reading-room/room.ts e2e/support/settle.ts test/e2e/room-kit-waits.test.ts` prints anything (Issue #785 sub 3 edits `rb5cLeans`, and Issue #1016 the kits).
- Any text a diff hunk above removes is not in its file exactly once.
- On commit 1, any test is red for a reason other than the assertion named for it, or GH2, V2, V3 or one of the 8 existing kit tests is red.
- `npm run check` reports any error, or `npm run lint` reports anything in the files this changes or in `e2e/suites/runninghead.ts`, `e2e/suites/print-room.ts`, `e2e/suites/broadside.ts`, `e2e/suites/reading-room.ts`, `e2e/suites/prospect.ts` or `e2e/suites/ribbon.ts` (the throw lint above all).
- `test/repo/e2e-read-types.test.ts`'s shape scan reports a finding in any edited file.
- Any of the three local e2e runs fails with `settle timeout prospect-glass-home`, `settle timeout ribbon-glass-home`, RH0's `unreachable: /`, `RH13: home never loaded`, or a `settle timeout` naming one of the seven labels (the readings say the Glass is home by read 8 and the veil lifts at the first press; a red here means the readings were wrong for that machine, which is the plan's, not the build's).
- CI's lane A or lane B fails PB2 to PB5, RB1 to RB5e, RH0, RH13, PR36, PR40, BR9, PB16, PB18 or RR38 on one of those labels.
- Reading the code to build it shows any of the 12 loops kept as loud has a caller that drops its answer.
- The prover returns HOLE for any mutation named under Tests.
