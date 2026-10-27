# Issue #751, pull request 2 (the loupe, PR #942): revision 1, Alex's rulings L1 to L3 on the review findings

**Planned at**: `origin/main` df6ba9315ee553ba0afae16aaeed9429fd6a8804 (one commit past the plan it revises, #945, which touches only `handbook/specs/settle-doctrine.md` item 12 and `.claude/skills/vellum-footguns/references/flake-record.md`, neither in this revision's touch set; `git merge-tree --write-tree` of main and the branch head reports no conflict); the branch `feat/751-the-loupe` at 44abaf37497549a852f03858f824bb8ea3f2883c; Issue #751 comments read: 29 (6315100702 holds rulings L1 to L3; the newest, 6318007956, holds Alex's rulings on this revision's menu); PR #942 comments read: 2 (the plate read 6310812013 and the guard prover's ledger 6310818655), review threads 0. Planner: `vellum-planner` (claude-opus-5-5[1m]), 2026-10-21; re-recorded the same day after folding comment 6318007956: `origin/main` still df6ba931 (fetched), the branch still 44abaf37, and `git diff --stat 362bc97a df6ba931` over every path this revision touches (`src/site/explorer`, `src/styles/explorer`, `src/styles/shared/atelier.css`, `test/site`, `e2e/suites/zoom.ts`, `e2e/suites/zoom`, `e2e/support/pixel.ts`, `e2e/suites/cluster/trail.ts`, the two specs, `handbook/errata/site.md`, `test/e2e/lane-timings.test.ts`) prints nothing. The drafts were not touched by the fold (they were written to M1 (a) and M2 C); `prettier --check`, `eslint --max-warnings 0` and `tsc --noEmit -p tsconfig.json` over them clean again, the three loupe unit files 16 of 16.
**Revises**: `751-loupe-plan-v2.md` in the scratchpad, archived on the issue as comments 6309647456 and 6309648618 and on the branch as `handbook/plans/751/751-loupe-plan.md`, which stays frozen. This file is a diff list against that plan: every section it does not name stands as written there. Calls continue from 70.
**Archived as**: `handbook/plans/751/751-loupe-r1-plan.md` (free on the branch: `git ls-tree 44abaf37 handbook/plans/751/` lists `751-loupe-plan.md`, `751-plan.md`, `751-r1-plan.md`, `751-r2-plan.md`).
**Rulings**: Issue #751 comment 6315100702 (2026-10-21), rulings L1 to L3, and https://github.com/ahl-gram/Vellum/issues/751#issuecomment-6318007956 (2026-10-21), Alex's answers to this revision's menu. **L3** folded: the tablet grip at the box's corners is Issue #943, apart from this pull request; nothing here touches the grip. **L1** was taken again on a measured false premise (r1-1) and is replaced by **M1 (a)**: keep the survey route in the loupe. **L2**'s look is **M2 C**: the loupe goes dark, opaque chart ink, wherever it hangs off the map. Both are under "Rulings folded".
**Open decisions**: none.

## What was measured for this revision

Every number below was measured on 2026-10-21 in the harness's own browser (headless Chromium through `findBrowser`, device pixel ratio 1) against a build of the branch head 44abaf37, with the spike's arms injected uncommitted where named. Probes: `out/scratch-751-loupe-r1/` in the planner's tree (`probe-ages.ts`, `probe-track-touch.ts`, `probe-geometry.ts`, `probe-arms.ts`, `probe-arms-touch.ts`, `probe-bare.ts`), copied with their records to the scratchpad folder `751-loupe-r1-probes/` beside this plan. The plate reader's independent run over the same spike is `out/751-loupe-r1-plate/` (its `notes.md` and `contrast-table.md` carry every table).

- **r1-1, L1's premise.** On the Explorer the survey box is the survey ink, not a chronicle. Ticking it hid 0 of 26 settlements and left the roads layer's inline display empty, over six reads across 3 s; the voyage overlay's display stayed empty and its track held 127 points; `window.__vellumAgesState` is undefined on the Explorer; a link carrying `year=900` landed on `/reading-room/` (`forwardTarget` in `src/site/explorer/address.ts`), and a link carrying `survey` gave the ticked state. By code: the Explorer hands `createLivingChart` no scrubber, so `agesFor` takes `barlessAges` (`isActive: () => false`, every arm silent), and `applyScrub`, `scrubTo` and `paintYear`, the only code that sets `display: none` on a settlement or the roads, have no call site under `src/site/explorer/` (recon ledger, STALE row; `handbook/specs/explorer-doctrine.md`, "The two hosts differ on purpose": the Explorer keeps SPACE, the Reading Room keeps TIME). The relayed finding read `setOverlayVisible(false)` in `src/site/shared/living-chart/ages.ts`, which only the Reading Room's instrument calls.
- **r1-2, what is real in the finding.** A lit lens that nothing moves keeps a stale survey copy. On the 1024 by 768 tablet with the loupe lit: ticking the survey inked the live track (4565 characters of points) and the lens held no copy until the grip was dragged; after a drag it held the copy; unticking removed the live track and the lens kept its copy. On a computer with the pointer resting on the chart and the box toggled from the keyboard, the same: no copy after ticking. Nothing calls the lens's `show` on those paths: the box's change handler calls `home` before the deferred arm lands, and the untick calls no camera at all.
- **r1-3, where the lens can reach the chrome.** The gesture box against every piece of chrome, at 1024 by 768 open and folded, 1280 by 800 open and folded, and the 1024 by 768 tablet open and folded: no piece of chrome overlaps the box in any of the six; a lens centred inside the box reaches the head cluster, the chart folio, the legend row and the Glass in every layout, the room folio when the Broadside is folded, and the slip (opaque) when it is open. At 1280 by 440 the page is floored (`stage-under`) and the box runs under the head cluster, the chart folio and the legend row, all three already standing on their pools.
- **r1-4, the arms' contrast** (the plate reader's run, 35 lines under the lens disc over eight positions, glyph pixels against the ground under them, the minimum reported; the floor 4.5 for text, 3 for a press glyph):

  | arm | lines under the floor | lowest minimum on the 14 lines the control fails | at k = 2 |
  |---|---|---|---|
  | at rest (no lens) | 1 of 35 (the hold press at k = 2, 2.99, which every arm shares) | 5.32 | 2.99 |
  | control (today) | 14 of 35 | 1.07 | 3.01 |
  | A, the chrome takes its pools while the lens shows | 0 | 4.81 | Glass 8.64 |
  | B, the lens is cut at the sheet's edge | 0 | 5.32 (every line back to its at-rest value within 0.01) | 3.01 |
  | C, the lens shows opaque chart ink past the sheet's edge | 1 of 35 (the hold press at k = 2, 2.98, the line that reads 2.99 at rest and 3.01 in the control: the fog's drift, and no arm moves it) | 5.30 (every line at or above its at-rest value within 0.02) | 2.98 |
  | D, a darkened rim (tried) | 14 of 35 | 1.07 | 3.01 |
  | E, the lens's ground in chart ink (tried) | 1 of 35 | 2.47 | 3.01 |

  C's earlier passes: at 0.92, 0 lines under the floor and a lowest minimum of 4.69; at 0.95, 0 lines and 4.92. D and E fail and are not offered.
- **r1-5, what each arm changes elsewhere.** Mid-sheet (the lens wholly on the sheet, on the capital's label): A, B and C each differ from the control by 0 of 90,000 px; D by 27,503. At the sheet's edge, arm A switches four pools and the Glass presses' grounds as the lens shows and hides: 70,774 to 85,502 px outside the lens change, 7.7 to 10.9 percent of the window, mostly the head cluster. On the tablet with the lens 10 px above the sheet's bottom edge: the grip whole and reachable in every arm, attached to the lens in the control, A and C, floating 115 px from a cut lens in B.
- **r1-6, the darkness of C.** `--line-tan` (the chart folio's second and third lines, the chrome's faintest ink) over chart paper under chart ink at alpha a, computed with the WCAG formula: 0.90 reads 4.13, 0.92 (the pools' own darkness) 4.39, 0.93 4.51, 0.95 4.79, 1 (opaque) 5.48; over bare paper 1.94. But in a chart room the fog paints above the stage (`body.chart-room .fog { z-index: 3 }` in `src/styles/shared/atelier.css`: two drifting radial washes, up to 4% `--parchment` and 3.6% `--line-tan`), so it lightens the lens and its dim, while the pools, painted by the corners above the fog, are not lightened. Measured with the vignettes hidden at one spot below the sheet (`probe-bare.ts`): bare paper (241, 232, 206); opaque (65, 52, 35), not (61, 47, 31); 0.95 (75, 61, 44); 0.92 (79, 66, 49). Under the fog's peak, computed: opaque 4.63, 0.95 4.04. The plate reader's tablet patch at 0.95 read 4.51 at its median and 4.44 at its lightest pixel, which is what found the fog. Opaque, the bare patch past the sheet (chrome hidden) reads 5.12 at its median and 5.02 at its lightest pixel on the tablet with the fog as painted (the lowest of five reads 20 s apart; the five do not span the fog's whole 630 s beat), 5.43 with the fog hidden; at position 1, 5.34 and 5.26, and 5.42 hidden. The vignettes add darkness in the window's top and bottom bands, which is why 0.92 read 4.69 at the folio.
- **r1-7, frame cost.** A lens drag along the sheet's bottom edge at 1280 by 800, three reps per arm: every arm and the lens-off run read a 16.67 ms mean, no frame over 20 ms (the headless clock steps at 16.7 ms, so this says only that no arm adds cost there).
- **r1-8, the drafts.** Every code block under "Files" was applied to an extract of the branch head (`751-loupe-r1-fmt/tree/` in the scratchpad, from `git archive 44abaf37`, the main checkout's `node_modules` linked): `prettier --check` and `eslint --max-warnings 0` over every touched file, and `tsc --noEmit -p tsconfig.json`, all clean; the three loupe unit files 16 of 16 green; against the red stubs below, exactly U5, U13 and U14 red, each on an assertion (`751-loupe-r1-fmt/751-stub-red.log`). Lint-counted lines after the change: `loupe-view.ts` 33, `loupe.ts` 138, `loupe-bind.ts` 134, `loupe-page.ts` 47, `e2e/suites/zoom/loupe.ts` 371 (from 389), `e2e/suites/zoom/loupe-chart.ts` 130, `e2e/suites/zoom.ts` 178, `test/site/loupe-bind.test.ts` 234, `test/site/loupe.test.ts` 128, `test/site/loupe-view.test.ts` 58; `src/site/explorer/app.ts` 398 and `src/site/shared/zoom-controller.ts` 396, both untouched. The whole diff is `751-loupe-r1-fmt/r1-drafts.diff`. The drafts built (`npm run build` in the extract) and `VELLUM_E2E_SUITES=zoom node e2e/run.ts` read 73 of 73 in 100 s (`751-loupe-r1-fmt/751-tree-zoom.log`): ZL4's nine reads as planned, ZL6 `gone` with no copy and `back` with one, ZL7's off patch (61, 47, 31) at 5.48 and its on patch (202, 206, 187) at 1.47, `covers` true. After the plan skeptic's round ZL7 was rewritten (finding 1 and 2 below) and run again: 73 of 73, ZL7's off patch (61, 47, 31), its on patch (202, 206, 187) at 1.47, `room` 0, `covers` true (`751-tree-zoom2.log`). Rows run by the planner the same way, each alone on the extract and restored: `zl-mount-unwatched` red exactly ZL6 (72 of 73, `gone` holding its copy; `751-mut-zoom.log`); `zl-room-undimmed` red exactly ZL7 (the off patch (242, 232, 207) at 1.94, against the first ZL7; `751-mut-zoom2.log`); `zl-paper-unshifted` red exactly ZL7 (`room` 474.4; `751-mut-zoom3.log`); `zl-room-translucent` red exactly ZL7 (the off patch (71, 57, 40); `751-mut-zoom4.log`); on the unit files, `zl-room-in-grip` red exactly U4 and U5, `zl-paper-unshifted` and `zl-paper-powered` exactly U5 and U13, each on an assertion (`mut.py` in the same folder). The implementer still proves every row as R5 says. `npm test` over the whole extract read 2726 of 2743: the 17 failures are the tests that read git (`git ls-files`, tracked and ignored files) or the tree's own layout (a linked `node_modules`, a built `dist/`), which a plain extract cannot satisfy (`751-loupe-r1-fmt/751-tree-npmtest.log`), none of them a loupe file; the implementer's `npm test` in its own tree is the evidence for the suite.

## Specs (added to the plan's list)

- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract", the bullet "The two hosts differ on purpose" (r1-1) and the loupe's mount bullet (edited); "Counter-scale", the loupe's bullet (edited under M2 C).
- `handbook/specs/ui-design.md`: "The ground" (the vignettes are load-bearing contrast); "The room and its furniture" (the pools under the chrome while zoomed, and the provisional list, edited); "Colour, contrast and legibility" (the floor, the ground under the ink, the worst case; edited under M2 C).
- `handbook/specs/development-workflow.md`: step 6 (a ruling on a wrong premise goes back; stills for an appearance) and step 15 (a finding about this pull request's own work is fixed after its round).
- `handbook/specs/check-placement.md`: the browser lanes and a plate read (ZL7's rect half).

## The design, as it changes

### D1. The lens follows the chart's own marks (Alex's M1 (a))

`pageLoupe` in `src/site/explorer/loupe-page.ts` gains one line: a `MutationObserver` on `#map`'s own children (`childList`, not the subtree) that calls `binding.follow`. Every time the mount's children change (the survey track inked or taken off, a draw's wipe, the place overlay rebuilt, a region sheet mounted), a lit or held lens is placed again, so its copy of the track and its sheets follow the chart with nothing moving (r1-2). `follow` returns at once while the loupe is neither lit nor held (U11), so the observer costs nothing then. It also closes an older gap of the same kind: `keepDraw` in `src/site/explorer/app.ts` calls `motion.setDrawing(false)` before it assigns `lastSvg`, so the lens that `watch` re-places at that moment reads the outgoing world, and on an in-place draw nothing placed it again (on a computer until the pointer moved, on a tablet until a drag); the observer places it again after `mapDiv.innerHTML` takes the new sheet (the plan skeptic's reading of the code; no check reads the in-place path, which ZL2's turned draw does not take).

This is not the second observer of the sheet the plan rejected: that one would have copied half of `createMotion`'s predicate (the sheet's `turning` class); this one reads no state and decides nothing, it only asks the lens to place itself again when the mount's children change, which no predicate covers.

**Ruled M1 (a)**: the lens keeps showing over an inked survey and keeps copying its track (calls 51 and 52 stand); the survey joins no predicate, and D1 is the whole of the change.

### D2. The release of the key that held lets go (call 71)

`keyHands` in `src/site/explorer/loupe-bind.ts` records the `code` of the keydown that holds (`heldCode = e.code || null`) and lets go on a keyup whose `key` is the letter, as now, or whose `code` is that recorded code. The trigger stays the letter (ruling 5, call 55); call 55's "let go on the letter whatever is down" is amended by call 71: the release now follows the key the reader pressed, whatever character it reads as when it comes up. On macOS, L held, Option pressed and L released reads `¬`, which the letter match alone never hears (the cold skeptic's hypothesis, not observable without a real keyboard). A key whose event carries an empty `code` (some virtual keyboards) records nothing, so an empty code never matches another empty code. The remaining strand: macOS Chrome sends no keyup at all for a key released while Cmd is down, so the lens then stays until the keyboard leaves the map (Cmd+Tab and Cmd+L both move the keyboard out of the page) or L is pressed and released again.

**For Alex to try by hand on his Mac** (no harness can show what the OS sends): click the map, hold L, press Option, release L, release Option: the lens goes when L comes up. Then: hold L, press Cmd, release L, release Cmd: the lens stays (the known strand); tap L once and it goes.

### D3. Ruled M2 C: the lens is darkened where it lies past the sheet

- **Where**: a `div.loupe-room` inside `.loupe-glass`, after the copy's layer, the size of the sheet as it lies on screen and placed over it by `translate` in the lens's own coordinates; its `box-shadow` spreads opaque chart ink over every part of the glass outside that rect (`src/styles/explorer/loupe.css`). Inside the rect it paints nothing, so the lens over the sheet is untouched (r1-5: 0 px of 90,000 differ mid-sheet).
- **The rect**: `loupeView` in `src/site/explorer/loupe-view.ts` gains `paper`: the camera's translate less the lens's corner, at the camera's depth (`{ x: zoom.x - lens.x, y: zoom.y - lens.y, w: box.width * k, h: box.height * k }`), never the power. At rest it is the gesture box; zoomed, the sheet on screen is larger than the box and covers it (the zoom controller holds the sheet over the box), so the lens is darkened only where it hangs past the zoomed sheet's own edge, which happens only with the camera against that edge, and the chrome at depth already stands on its pools.
- **The darkness, opaque chart ink** (call 73): the fog paints above the lens in a chart room and lightens it (r1-6), so the darkness is the one that holds `--line-tan`, the chrome's faintest ink, at 4.5:1 under the fog's peak with no vignette behind it: opaque reads 4.63 there, 0.95 4.04, the pools' 0.92 less. The lens past the sheet then shows the desk's own ink with the desk's own fog over it, as the desk beside it does.
- **Placement** (call 74): pull request 1's rule holds inside the lens, a box placed by a transform and never by a fractional offset; the spread is `100vmax`, wider than any lens, so the sheet carries no copy of the diameter (call 59 of the plan wrote the diameter inline from its constant for the same reason).
- **Call 59, what changes**: it said "the lens's ground is chart paper, so where it hangs past the sheet's edge it shows paper; the stage clips it and every piece of chrome paints over it". The stage still clips it and every piece of chrome still paints over it; the ground under the copy is still chart paper, but no part of the lens past the sheet's edge as it lies on screen shows paper or the copy any more: it shows opaque chart ink, so whatever chrome paints over it stands on the desk's dark. Call 59 is superseded by call 73 to that extent.

- **UNVERIFIABLE: the clip on WebKit.** Every harness browser is Chromium; whether an iPad's WebKit clips a translated child's `100vmax` shadow to the rounded glass no command here can show. The room adds no new exposure: the copy's own layer (`.loupe-sheet`) is a translated child far larger than the lens and already relies on that clip, so a failure would already show as an unclipped copy. Alex's iPad, if he has one, is the evidence.

Rejected for C, with the reason: the pools' 0.92 and the first spike's 0.95 (each under 4.5 for `--line-tan` once the fog's peak lies over it, r1-6); dimming by the gesture box's rect rather than the sheet's on screen (zoomed, it would darken the visible chart past the box's rest rect); lifting the lens above the fog (it would reorder the room's stacking, which every chart room shares, for one instrument).

### D4. The browser checks move and grow

ZL6 moves out of `e2e/suites/zoom/loupe.ts` into a new part, `e2e/suites/zoom/loupe-chart.ts`, and grows the read of D1; ZL7 joins it; ZL4 grows the read of D2. `loupe.ts` read 389 lint lines and the two extensions would take it past 400 (call 72). A part file joins no roster: a suite's family is its folder (`e2eSuiteFamily`, `test/repo/e2e-tiers.test.ts` plants fixture paths only).

## Files (the diff list; every block is `751-loupe-r1-fmt/r1-drafts.diff`, verified as r1-8 says)

**`src/site/explorer/loupe-view.ts`** (24 lint lines, 33 after): the whole file becomes

```ts
// The loupe's geometry (Issue #751): the sheet point under the pointer sits at the lens centre, the copy magnified by the camera's depth times the power.
export interface LoupeInput {
  readonly at: { readonly x: number; readonly y: number };
  readonly box: { readonly width: number; readonly height: number };
  readonly zoom: { readonly x: number; readonly y: number; readonly k: number };
  readonly diameter: number;
  readonly power: number;
}

type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

export interface LoupeView {
  readonly lens: { readonly x: number; readonly y: number };
  readonly sheet: Rect;
  readonly paper: Rect;
}

export function loupeView(i: LoupeInput): LoupeView {
  const r = i.diameter / 2;
  const s = i.zoom.k * i.power;
  const lens = { x: i.at.x - r, y: i.at.y - r };
  return {
    lens,
    sheet: {
      x: r - (i.at.x - i.zoom.x) * i.power,
      y: r - (i.at.y - i.zoom.y) * i.power,
      w: i.box.width * s,
      h: i.box.height * s,
    },
    paper: {
      x: i.zoom.x - lens.x,
      y: i.zoom.y - lens.y,
      w: i.box.width * i.zoom.k,
      h: i.box.height * i.zoom.k,
    },
  };
}
```

**`src/site/explorer/loupe.ts`** (133, 138 after):
- `type Parts` gains `room: HTMLElement;` after `sheet: HTMLElement;`.
- In `buildLens`, before `const grip = part("div", "loupe-grip");`: `const room = part("div", "loupe-room");`; `glass.append(sheet);` becomes `glass.append(sheet, room);`; the return becomes `return { lens, sheet, room, world, inset, grip };`.
- In `show`, after `p.sheet.style.setProperty("translate", `${v.sheet.x}px ${v.sheet.y}px`);`, three lines:
  ```ts
      p.room.style.setProperty("width", `${v.paper.w}px`);
      p.room.style.setProperty("height", `${v.paper.h}px`);
      p.room.style.setProperty("translate", `${v.paper.x}px ${v.paper.y}px`);
  ```

**`src/styles/explorer/loupe.css`**: after the `.loupe-inset` rule, a new rule:
```css
.loupe-room {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  box-shadow: 0 0 0 100vmax var(--chart-ink);
}
```
No `display` on it (no rule toggles it), no comment (ZL7 pins the darkness through the contrast it reads).

**`src/site/explorer/loupe-bind.ts`** (132, 134 after): `keyHands` becomes
```ts
function keyHands(viewport: HTMLElement, hold: (held: boolean) => void): void {
  let heldCode: string | null = null;
  viewport.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!loupeKey(e)) return;
    e.preventDefault();
    heldCode = e.code || null;
    if (!e.repeat) hold(true);
  });
  viewport.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === LOUPE_KEY || (heldCode !== null && e.code === heldCode)) hold(false);
  });
```
with its `focusout` listener and closing brace unchanged. The line `if (!e.repeat) hold(true);` keeps its text, so the plan's rows `zl-key-unheard` and `zl-repeat-reholds` still find it. `KeyLike` and `loupeKey` are unchanged.

**`src/site/explorer/loupe-page.ts`** (46, 47 after): after `deps.motion.watch(binding.follow);`, the line `new MutationObserver(binding.follow).observe(mapDiv, { childList: true });`.

**`test/site/loupe-view.test.ts`**: U13 (below), appended.
**`test/site/loupe.test.ts`**: U4 and U5 each gain one assertion (below).
**`test/site/loupe-bind.test.ts`**: U14 (below), appended.

**`e2e/suites/zoom/loupe.ts`** (389, 371 after):
- `export` on `type Point`, `type Centre`, `type Lens`, `const CENTRE`, `const LENS`, `const LOADED`, `const mouse` (Prettier then breaks its line after `=>`), `const shown` and `async function setLoupe`, which `loupe-chart.ts` imports.
- After the `key` helper: `const OPTION_UP = { type: "keyUp", key: "¬", code: "KeyL", windowsVirtualKeyCode: 76, modifiers: 1 };`.
- Before `zl4HeldKey`, a helper that keeps that function under 50 lines (it reads 54 inlined):
  ```ts
  async function heldAtPointer(k: ZoomKit, p1: Point): Promise<[Lens, Lens, Lens, Lens, Lens]> {
    await mouse(k, p1.x, p1.y);
    const r0 = await lens(k);
    await key(k, "keyDown");
    const r1 = await pollLast<Lens>(k, LENS, shown, 40);
    await key(k, "keyUp");
    const r2 = await pollLast<Lens>(k, LENS, hiddenNow, 40);
    await key(k, "keyDown");
    const r2b = await pollLast<Lens>(k, LENS, shown, 40);
    await k.send("Input.dispatchKeyEvent", OPTION_UP);
    const r2c = await pollLast<Lens>(k, LENS, hiddenNow, 40);
    return [r0, r1, r2, r2b, r2c];
  }
  ```
- In `zl4HeldKey`, the six lines from `await mouse(k, p1.x, p1.y);` to `const r2 = await pollLast<Lens>(k, LENS, hiddenNow, 40);` become `const [r0, r1, r2, r2b, r2c] = await heldAtPointer(k, p1);`; `const reads = [r0, r1, r2, r3, r4, r5, r6];` becomes `const reads = [r0, r1, r2, r2b, r2c, r3, r4, r5, r6];`; the truth gains `shown(r2b) &&` and `hiddenNow(r2c) &&` after `hiddenNow(r2) &&`; the check's name becomes "ZL4 holding L while the chart has the keyboard shows the lens under the pointer, or at the chart's centre with no pointer over the chart, and letting go, with Option over the release or not, or the keyboard leaving the map, from the map or from a town on it, hides it, the press untouched (Issue #751)".
- Everything from `const AGES = (on: boolean): string =>` to the end of the file (AGES, TRACK_START, TRACK_COPY, `TrackCopy`, `trackRead`, `zl6TrackRides`) is cut, to `loupe-chart.ts`.

**`e2e/suites/zoom/loupe-chart.ts`** (new, 130 lint lines): the file as drafted at `751-loupe-r1-fmt/tree/e2e/suites/zoom/loupe-chart.ts`, whose pieces are:
- its first line, the one comment: "// The loupe against what the chart carries (Issue #751): the inked survey track it copies and follows, and the sheet's edge, past which the lens is dimmed so the chrome painted over it keeps its contrast.";
- imports: `sampleRect`, `tokenRgba`, `type Rgb` from `../../support/pixel.ts`; `contrast` from `../cluster/trail.ts` (already imported across suites by `e2e/suites/landfall/dress.ts`); `home`, `press` from `./hold.ts`; `pollLast` from `./registration.ts`; `CENTRE`, `LOADED`, `mouse`, `setLoupe`, `type Centre`, `type Point` from `./loupe.ts`; `type ZoomKit` from `./kit.ts`;
- `AGES` and `TRACK_START` as they were; `TRACK_COPY` gains `lens:!!l&&!l.hidden` (with `const l=document.querySelector(".loupe");`); `TrackCopy` gains `lens: boolean`;
- `trackRead` (ZL6's reads, below) and `zl6TrackRides`;
- the constants `PATCH_PX = 16`, `INSIDE_PX = 30`, `OFF_PX = 40`, `ON_PX = 40`; under the comment line "// 3 lies between `--line-tan` over bare chart paper (1.94) and over chart ink (5.48), computed 2026-10-21.", `UNDIMMED_UNDER = 3`; under "// Blink lays a box out in 1/64 px units, so two rects read against each other err by at most two of them.", `ROOM_SLACK_PX = 1 / 32`;
- the payloads `QUIET` (a style hiding `header.chrome,.corner,.legend,.slip,.slip-tab,.fog`, id `zl7-quiet`), `UNQUIET`, `DEPTH_2` (`__vellumZoomTo` at k = 2 centred), `ROOM` (the largest of the four differences between `.loupe-room`'s and `#map-viewport`'s client rects, or null) and `COVERS` (the lens shown, and `.loupe-room`'s client rect containing `.loupe-glass`'s);
- `probeAt(b: Centre): Probe | null`, `patch(k, p): Promise<Rgb>` (the per-channel median of a 16 by 16 `sampleRect` patch centred on `p`, rounded), `dimReads(k): Promise<Dim>` and `zl7DarkPastSheet`; imports gain `nearRgba` from `../../support/pixel.ts`.

**`e2e/suites/zoom.ts`**: `zl6TrackRides,` leaves the `./zoom/loupe.ts` import; after it, `import { zl6TrackRides, zl7DarkPastSheet } from "./zoom/loupe-chart.ts";`; in `zLoupe`, after the ZL6 step, `await step("ZL7", () => zl7DarkPastSheet(k));`.

**`test/e2e/lane-timings.test.ts`**: `MEASURED_SECONDS.zoom` re-read from this pull request's own lane A logs after the last commit that changes a check, as `handbook/specs/site-architecture.md` says.

**Doctrine**: under "Rosters and doctrine".

Not touched: `src/site/explorer/app.ts` (398), `src/site/shared/zoom-controller.ts` (396), `src/site/explorer/world-motion.ts`, `src/site/explorer/glass.ts`, the grip (Issue #943), every sheet but `loupe.css`.

## Tests, in the order they are written

**Red stubs, commit R1** (each test reds on an assertion, never a throw; measured, r1-8): `loupeView` returns `paper: { x: 0, y: 0, w: 0, h: 0 }`; `loupe.ts` builds and appends the room but writes nothing to it; `loupe.css` gains the `.loupe-room` rule WITHOUT its `box-shadow` line; `keyHands` and `loupe-page.ts` unchanged.

- **U13** (`test/site/loupe-view.test.ts`) "the paper's rect in the lens is the sheet as it lies on screen, the camera's translate less the lens's corner, at the camera's depth and never the power (Issue #751)": for each `k` of `DEPTHS` at power 3, `assert.deepEqual(v.paper, { x: ZOOM.x - (AT.x - 120), y: ZOOM.y - (AT.y - 120), w: BOX.width * k, h: BOX.height * k })`. Red at the stub on the deep equality. Mutations: rows `zl-paper-unshifted`, `zl-paper-unscaled`, `zl-paper-powered`.
- **U4** gains, after the diameter assertion: `assert.equal(lens.children[0]!.children[1]?.className, "loupe-room", "the room lies over the copy, in the glass");` (green at the stub, which seats the room; it holds the seat, and row `zl-room-in-grip` reds it on that assertion, never a throw).
- **U5** gains, after the layer's translate assertion: the room is `lens.children[0]!.children[1]` (no `!`, so a missing room reds on the assertion), and `assert.deepEqual([room?.style.width, room?.style.height, room?.style["translate"]], ["1585.1875px", "1223.6875px", "-280px -130px"], "the room is the sheet as it lies on screen, in the lens's own coordinates")` (the box 792.59375 by 611.84375 at k = 2, the lens at (180, 80): (-100 - 180, -50 - 80)). Red at the stub. Mutations: rows `zl-room-unplaced`, `zl-room-in-grip` and the three `zl-paper-` rows, each through the room's three values.
- **U14** (`test/site/loupe-bind.test.ts`) "the release of the key that held lets go, whatever character it reads as at release, and another key's release does not (Issue #751)": `rig()`; pointer at (310, 220); keydown `{ ...key(), code: "KeyL" }`: last call `show({ x: 300, y: 200 })`; keyup `{ key: "k", code: "KeyK" }`: no new call ("another key's release keeps the lens"); keyup `{ key: "¬", code: "KeyL", altKey: true }`: last call `hide` ("Option held over the L key's release still lets go"); keydown `{ ...key(), code: "" }`; keyup `{ key: "x", code: "" }`: no new call ("a key with no code of its own matches nothing"); keyup `{ key: "l", code: "" }`: `hide`. Red at the stub on the Option assertion. Mutations: rows `zl-letgo-ignores-code`, `zl-letgo-any-key`, `zl-letgo-empty-code`.

**Browser checks, commit R2** (red against R1's stubs on their assertions):
- **ZL4** (extended, `e2e/suites/zoom/loupe.ts`): after `r2`, L down again (`r2b`, shown) and the CDP keyUp `OPTION_UP` (`key` "¬", `code` "KeyL", Alt down): `r2c` hidden. Red at R1 (`r2c` shown). Mutations: rows `zl-letgo-ignores-code` and, as before, `zl-key-unheard`, `zl-focus-unheard`, `zl-blur-only`, `zl-held-nowhere`, `zl-left-still-shown`.
- **ZL6** (moved and extended, `e2e/suites/zoom/loupe-chart.ts`) "the inked survey track rides along in the lens, dressed as the chart's, leaves it and comes back with the chart's own as the survey is taken off and inked again with nothing moving, and the copy goes with the lens (Issue #751)": as before up to `copy` (the pointer on the track's first point); then, the pointer still, `AGES(false)` and `gone` (polled until the lens is shown and holds no copy); `AGES(true)`, `waitInked("zl6-back")`, `back` (polled until one copy with the source's points); then the loupe off and the overlay count. Truth: the old four on `copy`; `gone.lens && gone.copies === 0`; `back.lens && back.copies === 1 && back.same`; one overlay. Red at R1 (`gone.copies` 1, `back.copies` 0). Mutations: rows `zl-mount-unwatched`, `zl-track-uncopied`, `zl-track-kept`.
- **ZL7** (new, `e2e/suites/zoom/loupe-chart.ts`, `zl7DarkPastSheet`) "where the lens lies past the sheet it shows the desk's own chart ink, bounded by the sheet's rect exactly, where it lies on the sheet it is not darkened, and at twice the depth, the sheet filling the box, nothing in it is (Issue #751)": `home(k)`; `setLoupe(k, true)` (a real click, before the chrome is hidden); `probeAt` the gesture box: three quarters across, the pointer 30 px inside the sheet's bottom edge, the off patch 40 px outside it and the on patch 70 px inside it (the top edge where the window has no room below; none found is a named fault); `QUIET` hides the chrome and the fog, so the read is the lens alone, the vignettes as painted (the fog drifts on 70 s and 90 s cycles, so a read with it is not repeatable; its peak is in call 73's derivation instead); `mouse` to the pointer; `pollLast` until `LOADED`; the two patches' medians; `ROOM`, the largest difference between `.loupe-room`'s client rect and the gesture box's on any of left, top, width and height; `press(k)` (the hold, `.click()` wiring, so nothing drafts at twice the depth); `DEPTH_2`; `pollLast` `COVERS`. A `finally` runs `UNQUIET`, `setLoupe(k, false)` and `home(k)` (which lets the hold go). Truth: found, loaded, `nearRgba([...off, 255], tokenRgba("--chart-ink"))` (the off patch is the desk's own ink, which pins the darkness opaque: chart ink at 0.95 reads (71, 57, 40) there and reds), `contrast(--line-tan, on) < 3`, `room <= 1/32` (two of Blink's 1/64 px layout units), and covers; the contrast of `--line-tan` over the off patch goes in the detail. Built, the off patch reads (61, 47, 31) and the on patch (202, 206, 187) at 1.47, `room` 0. Red at R1 (the off patch pale, about 1.9, and the room at 0 by 0, so `covers` false). Mutations: rows `zl-room-undimmed`, `zl-room-translucent`, `zl-room-unplaced`, `zl-room-in-grip`, `zl-paper-unshifted`, `zl-paper-unscaled`, `zl-paper-powered`.

**Expected at each commit**: R1, `npm test` reds U5, U13 and U14 on their assertions and nothing else; R2, `VELLUM_E2E_SUITES=zoom npm run test:e2e` reds ZL4, ZL6 and ZL7 and nothing else; R3, everything green.

## Order of commits (on `feat/751-the-loupe`, after 44abaf37; each pushed)

- **R1** `#751 The loupe, revision 1: plan archived, the dim and the let-go stubbed, their unit tests red`: this file copied exactly (`cmp`) to `handbook/plans/751/751-loupe-r1-plan.md`; the stubs above; U4, U5, U13, U14. Before it: `npm run check`, `npm run lint`, `npm run format:check`; `npm test` as expected; `npm run astro:generate`.
- **R2** `#751 The loupe, revision 1: the browser checks, red`: the `loupe.ts` exports and ZL4, `loupe-chart.ts`, `zoom.ts`. Before it: the three checks, `npm run build`, `VELLUM_E2E_SUITES=zoom npm run test:e2e` once, as expected.
- **R3** `#751 The loupe dims past the sheet, follows the chart's marks and hears the key that held`: the drafts in full. Before it: the three checks, `npm test` green, `npm run build`, then one at a time `VELLUM_E2E_SUITES=zoom,zoom-gestures npm run test:e2e` and `VELLUM_E2E_SUITES=survey npm run test:e2e`, both green.
- **R4** `#751 Doctrine moves with revision 1 of the loupe`: the edits under "Rosters and doctrine", the errata row among them.
- **R5**: every row below proved at R4's sha: the rows with a browser red on the CI proof runner (selection `zoom`, the unit file named beside it), the unit-only rows on the runner or by hand, one at a time, committed first. PR #942 has had its prover, plate reader and cold skeptic rounds, so by workflow step 15 these guards are the implementing session's to prove and the PR body names them as proven by it; whether the prover and a cold skeptic get another round on this revision is the dispatcher's call, as it was on pull request 1 (call 24 there). The ledgers go in the PR body.
- **R6**: after CI on the last commit, `MEASURED_SECONDS.zoom` re-read; `vellum-plate-reader` on the final head, which the dispatcher's brief asks because the look changed; its record in a PR comment; the PR body's acceptance, guard table and records updated, naming this revision and its difference from the frozen plan.

## The proof list, revision 1 (finds verified against the drafts)

Each row a find-and-replace whose find occurs exactly once in its file at R4, proved as R5 says.

| id | file | find | replace | expected reds |
|---|---|---|---|---|
| `zl-paper-unshifted` | `src/site/explorer/loupe-view.ts` | `x: i.zoom.x - lens.x,` | `x: i.zoom.x,` | U5, U13; ZL7 (`room`) |
| `zl-paper-unscaled` | `src/site/explorer/loupe-view.ts` | `w: i.box.width * i.zoom.k,` | `w: i.box.width,` | U5, U13; ZL7 (`covers`) |
| `zl-paper-powered` | `src/site/explorer/loupe-view.ts` | `h: i.box.height * i.zoom.k,` | `h: i.box.height * s,` | U5, U13; ZL7 (the off patch and `room`) |
| `zl-room-unplaced` | `src/site/explorer/loupe.ts` | `    p.room.style.setProperty("translate", `${v.paper.x}px ${v.paper.y}px`);\n` | (empty) | U5; ZL7 |
| `zl-room-in-grip` | `src/site/explorer/loupe.ts` | `glass.append(sheet, room);` | `glass.append(sheet);\n  grip.append(room);` | U4, U5; ZL7 (the grip is not drawn on a computer, so neither is the room) |
| `zl-room-undimmed` | `src/styles/explorer/loupe.css` | `  box-shadow: 0 0 0 100vmax var(--chart-ink);\n` | (empty) | ZL7 |
| `zl-room-translucent` | `src/styles/explorer/loupe.css` | `  box-shadow: 0 0 0 100vmax var(--chart-ink);\n` | `  box-shadow: 0 0 0 100vmax rgb(from var(--chart-ink) r g b / 0.95);\n` | ZL7 (the off patch (71, 57, 40)) |
| `zl-mount-unwatched` | `src/site/explorer/loupe-page.ts` | `  new MutationObserver(binding.follow).observe(mapDiv, { childList: true });\n` | (empty) | ZL6 |
| `zl-letgo-ignores-code` | `src/site/explorer/loupe-bind.ts` | ` \|\| (heldCode !== null && e.code === heldCode)` | (empty) | U14; ZL4 |
| `zl-letgo-any-key` | `src/site/explorer/loupe-bind.ts` | `(heldCode !== null && e.code === heldCode)` | `true` | U14 |
| `zl-letgo-empty-code` | `src/site/explorer/loupe-bind.ts` | `heldCode = e.code \|\| null;` | `heldCode = e.code;` | U14 |
| `zl-keyup-needs-bare` (revised; the plan's find no longer occurs) | `src/site/explorer/loupe-bind.ts` | `if (e.key.toLowerCase() === LOUPE_KEY \|\|` | `if (loupeKey(e) \|\|` | U8 |

The plan's other rows stand with their finds unchanged, save that `zl-track-uncopied` and `zl-track-kept` now red ZL6 in its new part (the step label is the same); they are not re-sent unless R3 changes their lines, which it does not. `zl-follow-unguarded` stays IMPRECISE as the PR body records it.

## Rosters and doctrine

Rosters: `e2e/suites/zoom/loupe-chart.ts` joins no roster (the suite's family is its folder). No new page, sheet, bundle, suite or lane. `MEASURED_SECONDS` is re-measured (Gate 4 item 3). `test/repo/prose-paths.test.ts` resolves every backticked path below.

Doctrine, each written out; the builder reflows each edited paragraph as its file wraps prose:

1. `handbook/specs/explorer-doctrine.md`, "What may be mounted inside the chart mount", the loupe's bullet (the phrase wraps across two lines there): "and it copies the inked survey track while it shows and drops the copy when it hides." becomes "and it copies the inked survey track while it shows and drops the copy when it hides. A lit or held lens is placed again whenever the mount's own children change (`pageLoupe` in `src/site/explorer/loupe-page.ts`), so a track inked or taken off with nothing moving reaches it at once (`zl6TrackRides` in `e2e/suites/zoom/loupe-chart.ts`)."
2. Same file, "The camera, the gesture and the fit", the loupe's bullet (the phrase wraps across two lines there): "or at the chart's centre with no pointer over the chart; where touch" becomes "or at the chart's centre with no pointer over the chart, and the release of the key that held it lets it go whatever character that key reads as when it comes up (`keyHands` in `src/site/explorer/loupe-bind.ts`); where touch".
3. Same file, "Counter-scale", the loupe's bullet gains, after its last sentence: "Where the lens lies past the sheet as the sheet lies on screen it shows opaque chart ink, the darkness that keeps the chrome's faintest ink at 4.5:1 under the fog, which in a chart room paints above the lens (Alex, 2026-10-21, Issue #751): a room the size of that sheet, placed in the lens by a transform from `loupeView`'s `paper` (`src/site/explorer/loupe-view.ts`), spreads the dark outside itself, and `zl7DarkPastSheet` in `e2e/suites/zoom/loupe-chart.ts` reads it."
4. `handbook/specs/ui-design.md`, "Colour, contrast and legibility", a new paragraph after "Removing or changing a ground owes the whole surface a sweep." and its paragraph: "**A lens over the chart never puts paper under the chrome.** Where the loupe lies past the sheet it shows opaque chart ink, so every piece of chrome painted over it keeps a dark ground (Alex, 2026-10-21, Issue #751: the cream folio, masthead, room folio and Glass read as low as 1.07:1 over the light lens before). It answers what the pools answer for a pale chart reaching the chrome while zoomed, but opaque, because the lens lies under the fog and the pools above it: in a chart room the fog paints above the stage, and a darkness of 0.92 or 0.95 under the fog's peak leaves the faintest chrome ink under 4.5:1."
5. Same file, "The room and its furniture", the provisional list: "and the loupe's glyph, seat, name, key, size, power, rings and touch form." becomes "and the loupe's glyph, seat, name, key, size, power, rings, touch form and darkness past the sheet."
6. `handbook/errata/site.md`, `## Open`, a row after the two PR #939 rows (workflow step 15: a sibling defect found here goes to a row in the same diff): "- PR #942 (2026-10-21, high): over a zoomed Explorer chart (k = 2, 1024 by 768, seed 42, no loupe shown) the Glass's unlit \"Hold the sheet\" press reads 2.99:1 at its worst glyph pixel, under the 3:1 a press glyph is owed, and \"Draw nearer\" 3.73:1, against the ground their own half-ink fill makes over the pale chart (the step 6 plate read of Issue #751's loupe revision, its `zoom2.json`); the PR #784 row above records the class over floored charts and on home, not the zoomed Explorer. Searched: this directory for \"Glass\" with \"contrast\", \"half-ink\" and \":1\", and the open issues for \"Glass contrast\" and \"hold press contrast\": none but that row."

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`) at each commit, as "Order of commits" says.
- `npm run build`, then `VELLUM_E2E_SUITES=zoom,zoom-gestures` and `survey`, one at a time, only while no other lane's suite runs; never the lanes; CI runs the rest.
- Lane A's room: 32.1 s under the 0.3 cap (564.1 of 1955.3 measured seconds in `test/e2e/lane-timings.test.ts`, the plan skeptic's sum). This revision adds ZL7 (a home, two patches, a rect, a zoom and a home), ZL6's second ink and its two polls, and ZL4's two polls, about 4 s locally against the zoom suite's 100 s there, so about 9 s on CI at the 2.2 times this suite runs slower there: inside the room, re-measured at R6.
- The proof runner's ledger (and any hand proof, named as the implementing session's) over every row below, every row BITES and every control CLEAN.
- **`vellum-plate-reader` is owed again on the final head**, since the look changed. Its brief: the eight positions of `out/751-loupe-r1-plate/` (the folio twice, the masthead, the seed corner, the Glass, the legend row, k = 2, the floored page) and the tablet, every chrome line under the lens at or above its floor, against the at-rest reference; the lens mid-sheet unchanged against this pull request's step 11 read; the ring and the grip whole at the edges; the frame cost of a drag along the sheet's edge and of the held 24 times lens (the step 11 read's 42 frames a second is the baseline); no sideways scroll.
- The PR body leads the revision with L1 taken again and replaced by M1 (a) (comment 6318007956), L2's fix, M2 C, with its contrast table, and L3's Issue #943. Its "Look for these when you use it" gains the Mac hand test under "Rulings folded".

## Calls made (70 on; 47 to 69 stand, save call 59, superseded as D3 says, and call 55, amended by call 71)

The implementer posts these in one dated comment on Issue #751 that adds to comment 6310253982 (calls 47 to 69) and points at comment 6318007956 for Alex's rulings on M1 and M2 rather than restating them, before any review agent runs on this revision.

70. **The lens is placed again whenever the chart mount's own children change**, one `MutationObserver` on `#map` (`childList`) calling `follow`, which keeps the route in a lit lens in step with the chart under Alex's M1 (a). Rule: a finding about this pull request's own work is fixed after its round (workflow step 15), measured r1-2; it is not the second observer the plan rejected, which would have copied half of `createMotion`'s predicate: this one reads nothing and decides nothing.
71. **The release of the key that held lets go, whatever character it reads as at release**; the hold stays on the letter; an empty `code` matches nothing. Rule: ruling 5 names the letter as what holds the lens, and a hold whose release can go unheard strands it (the cold skeptic's Option case); recording the key the reader pressed is not choosing a physical key in advance, so a non-Latin layout is unchanged (call 55).
72. **ZL6 and ZL7 live in a new part, `e2e/suites/zoom/loupe-chart.ts`**, and `loupe.ts` exports the payloads and helpers they share. Rule: the 400-line cap (`loupe.ts` read 389, and ZL4's and ZL6's extensions take it past); one home per helper.
73. **The darkness past the sheet is opaque chart ink.** Rule: a bound is derived, and the derivation has to include the fog, which paints above the stage in a chart room and lightens the lens (r1-6): opaque holds `--line-tan` at 4.63:1 under the fog's peak with no vignette, 0.95 at 4.04 (the plate reader's 0.95 pass read 4.44 at one pixel on the tablet). The spike drew 0.92 and then 0.95 before the fog was found; the stills Alex ruled from (comment 6318007956) are the opaque pass.
74. **The darkness is a box-shadow spread of `100vmax` from a room the size of the sheet on screen, placed by `translate`.** Rule: pull request 1's placement rule (a transform, never a fractional offset); the spread names no copy of the lens's diameter (call 59's reason for writing the diameter inline).
75. **The paper's rect is `loupeView`'s `paper`**, pure and unit-tested beside the copy's. Rule: one home for the lens's geometry (call 50).
76. **ZL7 reads the lens alone, the chrome and the fog hidden, against `--line-tan`, and its zoomed half is a rect read.** Rule: in the harness window (1280 by 2400) no chrome stands within the lens's reach, so the guard models the ground and asserts it (`handbook/specs/ui-design.md`, the ground under the ink); the fog drifts, so a read through it would pass or fail by the time it was taken, and its peak is carried by the derivation (call 73); the zoomed half's cause is geometry, and the rect is the cheapest instrument that sees it (`handbook/specs/check-placement.md`).
77. **The Glass presses over a zoomed pale chart are left as they are.** They read 2.99 to 3.73 at k = 2 with no lens at all, the class `handbook/errata/site.md`'s Glass row records over floored charts and home; arm C changes nothing at depth (measured r1-4). Rule: a defect this pull request did not cause goes to an issue or a row in the same diff (workflow step 15), so doctrine item 6 adds the row; the dispatcher may fold it into an issue instead.
78. **ZL4 keeps one check and grows by a helper**, rather than a separate ZL4b. Rule: the Option release is one more way of letting go, which ZL4 already names; the helper keeps `zl4HeldKey` under the 50-line cap.
79. **`app.ts` and `zoom-controller.ts` are not touched.** Rule: the dispatcher's caps (398 and 396), held by putting D1 in `loupe-page.ts`.

## Ruled out, so nobody rebuilds them (added to the plan's)

- On this revision's menu (2026-10-21, comment 6318007956): **M1 (b)**, the loupe standing aside while the survey is inked (the survey joining the lens's `standing`), with its rewritten ZL6 and its row; **M2 A**, the chrome taking its zoomed pools while the lens shows, and the Glass presses darkened with it; **M2 B**, the lens cut at the sheet's edge by a clip.
- In this revision: the dim at the pools' 0.92 or at 0.95 (under 4.5 once the fog's peak lies over it, r1-6); arm D, a darkened rim, and arm E, the lens's ground in chart ink (each under the floor at some position, r1-4); dimming by the gesture box's rect at rest rather than the sheet's on screen; lifting the lens above the fog.

## The plan skeptic's findings, and what became of each

`vellum-plan-skeptic` ran cold on this revision, the plan it revises and the recon ledger (29 claims checked, 4 wrong, nothing BLOCKING). Every finding is folded:

1. *Three proof rows named the wrong reds, and nothing in the browser held the room's x* (SHOULD-FIX, a certain hand-back at R5). Folded: the three `zl-paper-` rows now name U5 beside U13 (U5 reads the room's three values) and ZL7; `zl-room-outside-glass`, whose reds were throws, gives way to `zl-room-in-grip`, which reds U4 and U5 on their assertions now that both read the room with `?.`; ZL7 gains `ROOM`, the room's rect against the gesture box's at home, which holds x, y, w and h together. Each corrected row was run (r1-8).
2. *ZL7's 4.5 floor did not hold call 73's opaque choice* (SHOULD-FIX). Folded: ZL7 asserts the off patch is chart ink to 2 per channel, and the row `zl-room-translucent` (chart ink at 0.95) reds it, run (r1-8).
3. *The menu's stills were not absolute paths* (SHOULD-FIX). Folded: every still in M2 is named by absolute path, with the dispatcher's copy step.
4. *The zoomed Glass press left as prose* (SHOULD-FIX). Folded: doctrine item 6 adds the errata row in R4; call 77 says so.
5. *D2 amends call 55 and the menu did not show it* (SHOULD-FIX). Folded: the calls' header and D2 name call 55 as amended by call 71, and the menu carries a no-decision item with the hand test.
6. *No lane arithmetic* (NIT). Folded: Evidence states lane A's 32.1 s of room and the estimate.
7. *D1 quietly fixes the in-place draw's stale world* (NIT). Folded: D1 names it. No check reads the in-place path: ZL6 holds the observer it rests on, and the suite drives turned draws.
8. *"Planned at ... unmoved" went stale* (NIT). Folded: main is at df6ba931, one commit outside the touch set, and merges with the branch cleanly.
9. *Doctrine item 4 read as a claim about the pools, and quoted 1.1* (NIT). Folded: "a darkness of 0.92 or 0.95 under the fog's peak", and "as low as 1.07:1".

## Rulings folded

Alex's answers to this revision's menu, 2026-10-21, https://github.com/ahl-gram/Vellum/issues/751#issuecomment-6318007956. They are his; the step 12 comment points at that comment rather than listing them as calls.

**M1 (a), ruled: keep the survey route in the loupe.** It takes ruling L1 (comment 6315100702) again and replaces it, the planner having measured its premise false (r1-1). The loupe works over a surveyed chart and shows the route magnified, and it redraws itself whenever the chart's marks come or go. What it changed: nothing in the drafts, which were written to this option; the survey joins no predicate; D1's observer and its ZL6 guard stand; the menu's other option and its code path are under "Ruled out".

**M2 C, ruled from the stills: the loupe goes dark wherever it hangs off the map.** It stays a whole circle with its rings and its grip, every chrome line reads as it does with no loupe (the faintest 5.3 either way), and over the map it is unchanged. The dark is opaque chart ink, and call 59's ground (paper past the sheet's edge) is replaced. What it changed: nothing in the drafts, which were written to this option. The stills he ruled from are the opaque pass of the plate reader's run: `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-abb6999e3cb7a0092/out/751-loupe-r1-plate/folio-c.png`, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-abb6999e3cb7a0092/out/751-loupe-r1-plate/masthead-c.png`, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-abb6999e3cb7a0092/out/751-loupe-r1-plate/glass-c-crop.png` and `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-abb6999e3cb7a0092/out/751-loupe-r1-plate/tablet-c-crop.png` (the folder's page `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-abb6999e3cb7a0092/out/751-loupe-r1-plate/index.html`, copied to the main checkout by the dispatcher). Under the fidelity rule the build is held to those stills: chart ink, opaque, past the sheet's edge as it lies on screen.

**For Alex to try by hand** (in the rulings comment; not a decision): click the map, hold L, press Option, let go of L, then Option; the loupe goes when L comes up. With Cmd the Mac sends nothing when L comes up, and the page cannot hear it: the loupe stays until L is tapped again or the keyboard leaves the map.

Calls 70 to 79 stand for Alex to overrule.

## Open decisions

none.

## Stop conditions (added to the plan's)

Hand back, with the command and what it printed, if:
- Before R1: a comment on Issue #751 newer than the 29 this revision read that is not a plan archive; or `git diff --stat 44abaf37497549a852f03858f824bb8ea3f2883c origin/feat/751-the-loupe` prints anything.
- After R1: any lint-counted line count other than r1-8's for a touched file, `app.ts` other than 398 or `zoom-controller.ts` other than 396, or any file over 400 or function over 50.
- At R1, R2 or R3: anything red but the sets "Expected at each commit" names, or a red that is a throw.
- On the unmutated build: ZL7 finds no probe, reads the off patch more than 2 from chart ink on any channel, the on patch at 3 or more, `room` null or over 1/32, or `covers` false; ZL6's `gone` with a copy or `back` without one.
- Any proof row other than BITES with exactly its expected set after one re-send of that row alone; a control other than CLEAN.
- The re-measured `MEASURED_SECONDS` push lane A past the 0.3 cap.
- The plate reader finds a chrome line under its floor over the lens at any of its positions, the lens changed mid-sheet, a sideways scroll, or a drag frame cost above 1.5 times its step 11 read.
