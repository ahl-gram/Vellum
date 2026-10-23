# Issue #954: the descent, the Glass reaches band 5

**Planned at**: `origin/main` `6ee3c502086daba23cc218ee5457752bf73551a0` (Issue #1003's PR #1033 merged; every anchor this plan edits re-read there); Issue #954 comments read: 7.
**Rulings**: Alex, 2026-10-23, on D1 to D5: https://github.com/ahl-gram/Vellum/issues/954#issuecomment-6374207607 (folded below; see "The rulings, folded"). The orchestrator's correction on the square coast's owner: https://github.com/ahl-gram/Vellum/issues/954#issuecomment-6374102888.
**Open decisions**: none.

This plan builds Sub 4 of Epic Issue #395 at the depth Sub 0's sitting ruled: band 5, so `LOD_BANDS` grows from four entries to six, the Glass's ceiling goes from 8 to 32 and the hold's from 24 to 96 (Issue #950 comment 6330451217, corrected by comment 6341029326; Issue #954 comment 6341268473). It ships as one pull request.

## Specs

Read these first, at the sections named, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail": the hamlet and farmstead bullets (the tiers are keyed to named window sizes, never to the deepest band), "The detail level is a function of the WINDOW", "Hold ONE chain cache across region jobs", "A region-only change leaves the world sheets byte-identical".
- `handbook/specs/explorer-doctrine.md`, "The camera, the gesture and the fit": the hold bullet and "The address is a photograph" (both edited here); "Counter-scale, and what a test that never zooms cannot see": the whole-pixel-origin bullet and the loupe bullet (what the deeper hold multiplies).
- `handbook/specs/rulebook.md`, "The cost axis and ordering principle", "Golden and committed-chart discipline" (this is region-only: no regen, no golden move), and "Scheduling rules", the Issue #395 bullet (edited here).
- `handbook/specs/chart-dress.md`, the river bullet's sentence on the scalebar's claim (the bar's box is claimed before any label runs, so a bar longer than its box draws over labels); a paragraph on the bar's leagues is added after it (File 28).
- `handbook/specs/settle-doctrine.md`, items 4, 8 and 10, and "The environment".
- `handbook/specs/check-placement.md`, "The type checker" and "The unit suite".
- `handbook/specs/site-architecture.md`, "`MEASURED_SECONDS` is read from CI's own lane logs".
- `handbook/specs/conventions.md`, "The fidelity rule" (D1 is ruled from stills), "How a spec, and the rest of the house's prose, is written" and "How code is cited".
- `handbook/errata/README.md`, "A row" and "How a row leaves".
- `.claude/skills/vellum-footguns/SKILL.md` Gates 1, 2, 4, 5 and 6.

## What recon and the step-6 measurements changed

The probes are throwaway scripts in the planner's scratchpad (`954-square-coast.ts`, `954-costs.ts`, `954-stills.ts`, `954-control-check.ts`, `954-coast-where.ts`, `954-camera.ts`, `954-link-rounding.ts`, `954-link-witness.ts`, `954-sweep-cost.ts`) and the plate readers' scripts under `out/954/descent/scripts/`; nothing here depends on rerunning them.

- **The hamlets need nothing here.** `regionPeople` in `src/world/region.ts` gates hamlets on `HAMLET_MAX_WINDOW_UV` (0.125, `src/society/hamlets.ts`) and farmsteads and mills on `FARMSTEAD_MAX_WINDOW_UV` (1/32, `src/society/farmsteads.ts`) since PR #1024. The body's hamlet bullet and `deepestSizeUV` are stale. The guard is `windows no larger than band 3's grow hamlets and band 2's grow none; a hamlet never seats a realm and no road departs or arrives at one (#171, Issue #952)` in `test/world/region.test.ts`; it goes to the prover with the mutation the issue names.
- **Mara is fixed.** Recon ran chart 7 at both windows (band 4 `u0 0.4140625, v0 0.6328125`; band 5 `u0 0.4296875, v0 0.64453125`), bare and detailed: 0 lake cells drawn as land. `test/render/region-coast.test.ts` pins band 4 (`MARA_BAND4`).
- **The square coast is NOT fixed, and it is this issue's.** Issue #954 comment 6370333951 said it "stays with Issue #972"; the orchestrator's correction, comment 6374102888, supersedes that sentence: Issue #972's own plan (comment 6370297748, Calls made item 10) and its build record (comment 6370453300, item 8) say it "is a different defect and stays there", on this issue, and Issue #972 closed with the inverted fill fixed and the square coast untouched (PR #1032 changed the fill rings, not the chain). On the detailed arm at `e7437ad0`: chart 42's lake shore at world cell (143, 76) runs ruler-straight for 16, 32 and 63 region cells at bands 3, 4 and 5 (Sub 0 measured 63 before PR #1032); painted, 62, 135 and 267 px on the 1500 px sheet, 18, 73 and 148 px at the Explorer's 832; across 20 town windows the longest run at band 5 is median 10, largest 40 (chart 7 Numowopua). It sits on world cells' edges, where the chain's gate (`gateToParentLand` in `src/terrain/detail-guarantees.ts`) decides, which this epic's non-goals keep out. D2, ruled: band 5 opens as ruled and the straight shores are filed as their own issue (Appendix A).
- **The Print Room has no gathered-survey plate** (Issue #950 comment 6330451217); the body's plate-reader item for it is dropped.
- **Lane figures moved.** `stage` went from 250.1 to 360.2 s; lane A has 91.8 s of room under `BALANCE_CAP`, lane C 191.0 s, lane D 237.0 s. No suite moves lanes.
- **One more ceiling literal recon did not list**: `Math.min(want.k, 8)` in `lensVersusCamera` (`e2e/suites/zoom/loupe.ts`), which ZL3 reads.
- **A link at the bottom reopens on a neighbouring window 1.20% of the time**, against 0.48% at band 3 today: `writeHash` writes `cx` and `cy` at 4 decimals, and the band-5 lattice is four times finer (200,000 random cameras a band; 6 decimals: 0 of 200,000 at every band). D3, ruled: links stay as they are, and the acceptance line is re-ruled (The rulings, folded).
- **The Daily Hunt imports `src/site/explorer/camera.ts`** (`src/site/seed-of-the-day/app.ts`), and the Hunt may never reach the level-of-detail schedule (Issue #161; `test/site/hunt-zoom.test.ts`), so `camera.ts` takes no import of `src/world/lod.ts` (Design 2).
- **Epic Issue #844's inputs**: Issue #851 (the outline) landed in PR #965, but no Explorer or shared module sets `outline`, so the costs measured here stand; Issue #852 is open, and whichever lands second reconciles (`handbook/specs/rulebook.md`, Cross-epic coordination).
- **The step-6 plate read** of the spike (`out/954/descent/`, numbers in Design 9): the hold at 96 paints on band-5 and band-3 sheets and settles as fast as at 24; the loupe decodes and paints at lens 96 and 192; a town's or hamlet's ring sits up to 2.76 px off its dot at 96 (1.55 at 24); the crossing gap is 114 to 134 ms at the two new crossings against 110 at band 3's.

## The design

### 1. The band table (src/world/lod.ts)

`LOD_BANDS` gains two entries, each on the fixed 320 by 240 grid:

```ts
  { index: 4, k: 16, sizeUV: 0.0625, gridW: 320, gridH: 240, isRegion: true },
  { index: 5, k: 32, sizeUV: 0.03125, gridW: 320, gridH: 240, isRegion: true },
```

`bandFor` follows from the table unchanged: boundaries 1.414, 2.828, 5.657, 11.314, 22.627; the settle climbs into band 4 at k 12.67 and into band 5 at k 25.34 (boundary times 1.12), and drops out of them at 10.10 and 20.20. `detailForWindow` gives level 5 at 1/32, under `MAX_DETAIL` (6), so `OCTAVE_OFFSETS` does not grow.

One export is added after `LAST_BAND`, the one home of the Glass's ceiling:

```ts
export const DEEPEST_K = (LOD_BANDS[LAST_BAND] as LodBand).k;
```

### 2. One ceiling, read in both places

- `src/site/explorer/glass.ts`: `import { DEEPEST_K } from "../../world/lod.ts";`, and the two constants become

  ```ts
  const GLASS_MAX = DEEPEST_K;
  const HOLD_STRETCH = 3;
  const HELD_MAX = HOLD_STRETCH * GLASS_MAX;
  ```

  so the ruled stretch is the code (Alex: "the same 3x stretch, ceiling 96"). Nothing else in the file changes: `scaleExtent`, both `setScaleMax` calls, the let-go glide and `cameraForAddress` already read the names.
- `src/site/explorer/camera.ts` gains the pure parse a shared link's camera goes through, with the ceiling handed in, since the Daily Hunt imports this file and may not reach `src/world/lod.ts` (Issue #161):

  ```ts
  export function addressCamera(params: URLSearchParams, ceiling: number): Camera | null {
    const cx = params.get("cx");
    const cy = params.get("cy");
    const k = params.get("k");
    if (cx === null || cy === null || k === null) return null;
    const camera = { cx: Number(cx), cy: Number(cy), k: Number(k) };
    const finite = [camera.cx, camera.cy, camera.k].every(Number.isFinite);
    return finite && camera.k >= 1 && camera.k <= ceiling ? camera : null;
  }
  ```

  It is the parse `readHash` makes today, moved whole, with the literal 8 replaced by the argument; `camera.ts` gains no import. The grammar of every other key is Issue #1003's and does not move.
- `src/site/explorer/hash-sync.ts`: `import type { Camera } from "./camera.ts";` becomes `import { addressCamera, type Camera } from "./camera.ts";`, a line `import { DEEPEST_K } from "../../world/lod.ts";` is added after it, and in `readHash` the lines from `const cxRaw = params.get("cx");` through the closing brace of the `if (cxRaw !== null && cyRaw !== null && kRaw !== null) {` block become `const camera = addressCamera(params, DEEPEST_K);`. Nothing else in the file changes: `writeHash` keeps writing the camera at 4 decimals (D3, ruled).
- What holds "the ceiling read in one place": `GLASS_MAX` and `readHash` both read `DEEPEST_K`, which U1 holds to the last band's k. A literal put back in `readHash` (the issue's named mutation) reds RD5, whose link at k 32 then opens at home; a literal 32 written into `glass.ts` would pass every check, so that half is held by the one home, not by a test.

### 3. The Chart Table at depth

- `src/site/shared/table-address.ts`: `export type Rung = 1 | 2 | 3;` and its doc line (`/** The Glass's region bands. Narrow on purpose: ... */`) become these three lines, with no comment (U10 pins `RUNGS` to `LOD_BANDS`):

  ```ts
  export const RUNGS = [1, 2, 3, 4, 5] as const;
  export type Rung = (typeof RUNGS)[number];
  export const isRung = (n: number): n is Rung => (RUNGS as readonly number[]).includes(n);
  ```

  `regionBand` becomes `const regionBand = (rung: number): LodBand | null => (isRung(rung) ? (LOD_BANDS[rung] as LodBand) : null);`, and in `readItem` the line `const seat = regionBand(rung) ? (rung as Rung) : null;` becomes `const seat = isRung(rung) ? rung : null;`. The rest is unchanged, so one gate decides every rung the grammar reads and writes, and the type checker sees the same five the runtime accepts.
- `src/site/explorer/chart-drawer.ts`: the import list from `../shared/table-address.ts` swaps `type Rung` for `isRung`; `surveyItemFrom`'s first line becomes `if (!c.seat || !isRung(c.band) || !c.render.style) return null;` and `rung: c.band as Rung,` becomes `rung: c.band,`. `thumbJobFor` is unchanged: it indexes `LOD_BANDS[item.rung]`, which now holds band 5.
- The Portfolio redraws through the same `thumbJobFor` (`src/site/explorer/portfolio/app.ts`) and needs no edit.

### 4. The chain cache (src/site/explorer/region-chain-cache.ts)

`CAPACITY = LOD_BANDS.length + NEIGHBOURS` re-derives itself to 14 fields of 614,400 bytes; the comment's "about 7 MB held" becomes "about 8.6 MB held". Nothing else.

### 5. The scale bar (src/render/layers/scalebar.ts): leagues, with halves and quarters (D1, ruled)

A region bar starts at 2 leagues today, 301 px at band 4 and 602 px at band 5, against a paper backing that ends 223 px from the bar's start on the 1500 px sheet; the tick labels "2" at band 4, and "1", "2" and the word "Leagues" at band 5, lie off the paper and over the chart. Alex ruled "Leagues, with halves and quarters": the bar keeps leagues at every band and its length, and below band 3 it totals one league (ticks 0, ½, 1) at band 4 and half a league (ticks 0, ¼, ½) at band 5. It overturns the whole-number rule the test `#249: region scale-bar tick labels stay whole numbers (no fractional mid tick)` held. The world sheet and bands 1 to 3 draw exactly as today.

The build, in `src/render/layers/scalebar.ts`:

- `const REGION_NICE_TOTALS = [2, 4, 10, ...NICE_TOTALS];` becomes `const REGION_NICE_TOTALS = [0.5, 1, 2, 4, 10, ...NICE_TOTALS];`. (The ruled still's spike also listed 0.25, which no band from 1 to 5 ever picks: at band 5 a quarter league is 75 px and half a league 150.5 px, both under the 200 px target, so the half wins; the quarter is a tick, not a total.)
- A module constant `const FRACTIONS: Readonly<Record<string, string>> = { "0.25": "¼", "0.5": "½" };` after `REGION_NICE_TOTALS`.
- In `scalebarLabel`, the child `[String(value)]` becomes `[Number.isInteger(value) ? String(value) : (FRACTIONS[String(value)] ?? String(value))]`.
- Nothing else in the file changes: the totals' picking (`leaguesTotal`), the four cells, the backing, the caption `"Leagues"`, the three ticks at 0, half and the total, and both type sizes stand.

Bands 1 to 5 then draw, on the 1500 px sheet: `0 5 10`, `0 2 4`, `0 1 2` (as today), `0 ½ 1` over 150.5 px, `0 ¼ ½` over 150.5 px, every bar ending at x 240.5 or less against its claimed box's 305 (`planScalebar`'s 215 px box from x 90). This is exactly the ruled still (`out/954/scalebar-shots/a-half-leagues--b4--1500-crop.png`, `a-half-leagues--b5--1500-crop.png`; the geometry is the `a-half-leagues` rows of `out/954/scalebar/geometry.txt`), whose bar function reproduced today's sheet byte for byte at bands 3, 4 and 5 (`954-control-check.ts`), so the build owes the fidelity rule nothing beyond these three edits. At the Explorer's 832 px the ½ and ¼ read as 3-pixel marks (`a-half-leagues--b4--832-crop.png`), which Alex ruled with that still in front of him.

### 6. The e2e suites: the ceiling, or a fixed depth

A check that enters at k 8 and asserts band 3 is about band 3 and keeps its depth: k 8 still lands on band 3. A check about the Glass's ceiling or the hold's moves to 32 or 96. Calls C7 to C9 give the rules; Files 9 to 20 the edits.

| check | file | it is about | change |
|---|---|---|---|
| Z2 `z2MaxClamp` | `e2e/suites/zoom/camera.ts` | the ceiling | k 32, pan pinned at 31 viewports |
| Z8, Z20f, Z21, Z21b | `camera.ts`, `bands.ts` | band 3 | none, except Z21's scout |
| Z21 `z21Target` | `bands.ts` | the band hamlets first grow on | scouts at `HAMLET_MAX_WINDOW_UV`, not the last band |
| Z21c, new | `bands.ts` | the deepest band | the Glass at k 32 draws band 5's farmsteads and mills, and their names dry in at the hamlets' delay |
| `RANK` | `bands.ts` | tier order | gains `farmstead` and `mill` |
| `CEILING` | `e2e/suites/zoom/hold.ts` | the ceiling, unheld and held | asks for 200 |
| ZH1, ZH2, ZH3, ZH5, ZH5b, ZH8, ZH9 | `hold.ts` | k 8 and k 4 | none |
| ZH4a to ZH4d (`homeCheck`) | `hold.ts` | the ceiling after a let-go | 32 |
| ZH6 `zh6HeldCeiling` | `hold.ts` | the hold over the deepest sheet | band 5 entered at k 28, held to 96, address 32 |
| ZH7 `zh7LetGoMidGlide` | `hold.ts` | the let-go from above the ceiling | from 96 to 32 |
| `PICK_WINDOW` | `e2e/suites/zoom/registration.ts` | the band hamlets first grow on | scouts at `HAMLET_MAX_WINDOW_UV` |
| `DEPTH`, ZH10a, ZH10b, ZH11, ZH12 | `registration.ts` | registration at a held depth, bounded at 24 | stay at 24; `deep()` reads the address's new `24.0000` |
| ZH13 | `registration.ts` | print | none |
| ZH14, ZH14b | `registration.ts` | the ceiling | 32 |
| ZL3 `regionArm`, `lensVersusCamera` | `e2e/suites/zoom/loupe.ts` | the lens at 24 | the address now carries 12 and 24 |
| FL7 `fl7Degenerate` | `e2e/suites/corners/floor.ts` | a deep camera | none |
| `DEEP` and its checks | `e2e/suites/chart-drawer/reads.ts` | band 3 | none |
| CD63, new | `e2e/suites/chart-drawer/desk.ts` | the deepest band | a band-5 sheet is laid, carried as rung 5, redrawn |
| `LINK`, RD1 to RD5 | `e2e/suites/region-detail.ts` | the ladder and the bottom | the ladder to band 5; RD2 to RD5 at band 5 |
| `waitRedraft`, `waitInset` | `zoom/kit.ts`, `glass-ceremony.ts`, `region-detail.ts` | the budget | one exported `REDRAFT_TRIES`, re-derived |

### 7. The wait budgets

The three `waitRedraft`s and `waitInset` poll 375 times at 40 ms, 15 s. The slowest draw the descent adds is band 5's cold first descent: 1,775 ms in the caption for seed 42's capital at k 32 (three loads within 15 ms of each other; seed 2's target, 1,657 ms; band 3's control 1,186 ms). Times CI's factor in `handbook/specs/settle-doctrine.md` item 10 (20 s on CI where 6 s passes locally, 3.3) that is 5.9 s, so 15 s keeps more than twice the CI figure and the budget stays. It gets one home: `REDRAFT_TRIES` in `e2e/suites/zoom/kit.ts`, with the dated derivation at the constant, imported by the other two suites. `DRAWN` (400 polls of 50 ms) in `e2e/suites/chart-drawer/reads.ts` covers CD63's band-5 draws on the same arithmetic and is unchanged.

**The cost to the suites, priced from the step-6 times** (a cold band-5 draw 1.78 s against band 3's 1.18 s, a warm step 0.55 s at any band, a band-5 pan 0.59 s against 0.52 s, a held camera at 96 settling as fast as at 24), CI at 3.3 times local:

- **Lane A** (`zoom`): Z21c adds one cold band-5 draw and one in-page engine draw of the same window for its parity read, about 3.6 s locally; ZH6 trades a band-3 entry for a band-5 one, about +0.6 s; ZH7 enters the window ZH6 just drew, about +0.1 s; Z2 runs with the redraft off and adds nothing; the registration checks keep their depth. About 4.3 s locally, 14 s on CI, against 91.8 s of room under `BALANCE_CAP`.
- **Lane D** (`region-detail`, `chart-drawer`): RD1's two new steps (0.53 and 0.57 s), RD2's two in-page band-5 draws (about +0.6 s over band 3's), RD3's cold direct descent (+0.6 s), RD4's pan (+0.07 s), RD5's two cold links (+0.6 s each), about 3.6 s; CD63's two page loads with cold band-5 draws and the reload's redraw of its cutting, about 7 s. About 10.6 s locally, 35 s on CI, against 237 s of room.
- **Lane C** (`corners`): nothing changes.
- **The unit suite**: `test/site/region-detail-wiring.test.ts` took 13.1 s locally at `e7437ad0`; it gains two band tests of three draws each (two detailed, cold) and its six deepest-band draws move from band 3 to band 5, about +12 s; the table sweep at rungs 4 and 5 adds 29 ms. CI's unit shards ran 3m16s to 5m23s against `timeout-minutes: 9`.
- No lane approaches the cap, so no suite moves; Stop conditions 6 and 7 are the backstop.

### 8. The measuring scripts

- `scripts/region-detail/cost.ts`: `DEEPEST` becomes `CACHE_BAND = LOD_BANDS[3] as LodBand` (the band Issue #400's and Issue #450's held-cache figures were measured at), every use renamed, and the summary line's literal `"band 3"` becomes `` `band ${CACHE_BAND.index}` ``. `wholeDraws` keeps looping `LOD_BANDS.slice(1)`, so it now prints bands 4 and 5 under their own labels.
- `scripts/region-detail/probes.ts`: `HAMLET_MAX_WINDOW_UV` joins the import from `../../src/society/hamlets.ts`; the line `const deepest = (LOD_BANDS[LOD_BANDS.length - 1] as LodBand).sizeUV;` is deleted and the gate becomes `if (du <= HAMLET_MAX_WINDOW_UV + 1e-9) {`, the gate `regionPeople` itself uses.
- `scripts/region-detail/sweep.ts`, `partition.ts` and `sweep-measure.ts` name bands 1 to 3 and are unchanged; `settlementsOffRoadNetwork` therefore never counts a farmstead.

### 9. What band 5 is on screen (the step-6 plate read, `out/954/descent/`)

- **Felt cost**, the caption's "drawn in N ms": a cold link at the bottom 1,771 to 1,775 ms on seed 42's capital and 1,654 to 1,660 on seed 2's target, against 1,171 to 1,186 and 1,116 to 1,126 at band 3, about 1.5 times; a stepped descent by "Draw nearer" redrafts on presses 2, 4, 6, 8 and 10 at 721, 528, 550, 534 and 571 ms, so bands 4 and 5 cost what bands 2 and 3 do once the worker is warm; a pan at band 5 589 ms against 520 at band 3. Eleven presses reach the bottom from home (seven today), fourteen the held 96.
- **The hold at 96 paints** on a held band-5 sheet and on a held band-3 sheet (an 8,435 by 6,512 px inset), with no blank frame, and settles in 1.1 to 1.2 s, as at 24 and 32. Near a band-5 window's edge the view at 96 shows the world sheet beyond it (27% of the chart in one place), the same 2.7 to 1 ratio of window to view that the hold at 24 has over a band-3 sheet today, so it is not new.
- **The loupe** decodes and paints at lens 96 and lens 192; at camera 48 its paint sits 2 px off the camera's at 96 (correlation 0.85), against 1 px at 24 (0.92), one run each.
- **Registration at 96**: the click area 0.40 to 0.95 px and the ring 0.52 to 2.76 px off the painted dot, against 0.53 to 0.88 and 0.22 to 1.55 at 24 in the same run; witnesses round by 44.5 to 47.8 px at 96.
- **The crossing**: the outgoing sheet is gone 114 to 134 ms before the incoming coast is 90% drawn at the 3-to-4 and 4-to-5 crossings, against 110 to 111 ms at 2-to-3 (two runs each). D4, ruled: accepted, and the ledger row closes.
- No console error and no 4xx on any page.

## Alternatives rejected

1. **A literal ceiling in each file** (32 in `glass.ts`, 32 in `readHash`). Two homes for one ruling is how today's `k <= 8` stands apart from `GLASS_MAX`; the issue asks for one place.
2. **Testing `readHash` with a stubbed `location` and fake selects.** `readHash` reads the DOM (`Controls`), so a unit test would assert the stub. The parse moves into `camera.ts`, which is pure and has a test file, and `readHash` keeps one call.
3. **`Rung` derived from `LOD_BANDS` with `as const satisfies`.** It changes the declared type of a table about twenty-five call sites index, for a narrowing three files use; `RUNGS` with a test holding it to `LOD_BANDS` gives the type checker the same five rungs at no risk to the rest.
4. **`Rung = 1 | 2 | 3 | 4 | 5` with a guard that reads `LOD_BANDS`.** A type claim no test ties to the table drifts the way the cast did.
5. **The registration checks (ZH10b, ZH11 to ZH13) on a band-5 sheet.** Seed 42 has no band-5 window with the 8 hamlet candidates `PICK_WINDOW` needs (3 at most), and the error those checks guard is multiplied by the camera's depth, not by the band (`handbook/specs/explorer-doctrine.md`, Counter-scale).
6. **The registration checks moved to 96.** At 3 px they would flake (the ring measured 2.76 px off at 96); at half the witness floor (12 px) they would pass a fixed offset of 3 to 12 px that fails at 24 today. The depth-multiplied defect they exist for already stands 6 px or more off at 24, so 24 catches it; the 96 reading is the plate reader's at step 6 and again at step 11.
7. **`addressCamera` importing `DEEPEST_K` itself.** The Daily Hunt imports `camera.ts` (`src/site/seed-of-the-day/app.ts`), so the Hunt would reach the level-of-detail schedule, against Issue #161's boundary (`test/site/hunt-zoom.test.ts`), with the lint blind to it (the PR #724 row in `handbook/errata/guards.md`). A module of its own for the parse would be a new file, a naming call of Alex's; the ceiling as an argument costs one line in `readHash`.
8. **ZL3 at the deepest comparable depth (camera 48, lens 96).** Measured once: 2 px off, outside `SHIFT_PX` (1), which was bounded at 24 alone; widening it on one sample is a bound fitted to a sample (D5).
9. **Raising the 15 s budget.** The derivation keeps it (Design 7); a longer one only lengthens a real hang.
10. **A separate pull request for the scale bar.** Its overrun exists only once the band table grows, its tests read the table, and a split adds a merge-order pair inside one sub for no gain.

## Files

Every file stays under 400 lines (lint `max-lines`, blank and comment lines skipped) and every function under 50.

**Source**

1. `src/world/lod.ts`: the two `LOD_BANDS` entries and `DEEPEST_K` (Design 1). The first commit's stub: `export const DEEPEST_K = 8;` after `LAST_BAND`, the table unchanged.
2. `src/site/explorer/glass.ts`: the import and the three constants (Design 2).
3. `src/site/explorer/camera.ts` (21 lines): `addressCamera` (Design 2), no import, in the first commit exactly as Design 2 (U8 hands it the stub `DEEPEST_K`, 8, so it refuses 32).
4. `src/site/explorer/hash-sync.ts`: the two import lines and the camera block (Design 2).
5. `src/site/shared/table-address.ts`: `RUNGS`, `Rung`, `isRung`, `regionBand`, the `seat` line (Design 3). The first commit's stub: `RUNGS = [1, 2, 3] as const`, with `Rung`, `isRung` and `regionBand` as Design 3 and `readItem` unchanged.
6. `src/site/explorer/chart-drawer.ts`: the import, `surveyItemFrom`'s gate and its `rung` line (Design 3).
7. `src/site/explorer/region-chain-cache.ts`: the comment (Design 4).
8. `src/render/layers/scalebar.ts` (138 lines): the three edits of Design 5.

**Unit tests** (Tests U1 to U17): `test/world/lod.test.ts`, `test/explorer/camera.test.ts`, `test/site/table-address.test.ts`, `test/site/chart-drawer.test.ts`, `test/render/region-scalebar.test.ts`. `test/site/region-detail-wiring.test.ts` loops `LOD_BANDS` and needs no edit (it gains two band tests and its deepest-band tests draw band 5). `test/repo/constant-contracts.test.ts` passes unchanged.

**e2e**

9. `e2e/suites/zoom/kit.ts`: above `zoomInsetView`, `export const REDRAFT_TRIES = 375;` with this one line above it, replacing the comment inside `waitRedraft`: `// 2026-10-23, Issue #954: 375 polls of 40 ms, 15 s; the slowest redraft a suite waits on, band 5's cold first descent, drew in 1775 ms locally (seed 42's capital, three loads within 15 ms), times CI's 3.3 (handbook/specs/settle-doctrine.md item 10) is 5.9 s, so 15 s keeps twice that.` `waitRedraft` loops `i < REDRAFT_TRIES`.
10. `e2e/suites/zoom/camera.ts`, `z2MaxClamp`: in the payload `ex:-(7*W),ey:-(7*H)` becomes `ex:-(31*W),ey:-(31*H)`; the check reads `z2.s.k === 32`; its title becomes `"Z2 clamps at the max extent (k->32, the deepest band's k, pan pinned to the far edge so the sheet still covers the viewport) (Issue #954)"`; the shot `explorer-zoom-k8.png` becomes `explorer-zoom-k32.png`.
11. `e2e/suites/zoom/bands.ts` (Tests E2 and E3): the module constant `RANK`, `z21Target`'s scout, Z21's title, and the new `z21cFarmsteads` with its read `z21cRead` and payload `CAPITAL_DEEPEST`.
12. `e2e/suites/zoom.ts`: after `await z21bOneBandUp(k, target21, deep21);`, `await step("Z21c", () => z21cFarmsteads(k));`, and `z21cFarmsteads` joins the import from `./zoom/bands.ts`.
13. `e2e/suites/zoom/hold.ts` (Tests E4 and E5): `CEILING`, `homeCheck` and the four ZH4 titles, `FIRST_HAMLET` replaced by `FIRST_LABEL`, `zh6HeldCeiling`, `zh7LetGoMidGlide`, ZH8's title, and the module constant `const DEEPEST_ENTRY = 28;` with no comment (the settle climbs into band 5 at k 25.34 from home, and ZH6's `entered.band === 5` pins that 28 lands there).
14. `e2e/suites/zoom/registration.ts` (Test E6).
15. `e2e/suites/zoom/loupe.ts`: in `regionArm`, `d.hashK === "8.0000"` becomes `d.hashK === "12.0000"`; in `lensVersusCamera`, `Math.min(want.k, 8)` becomes `Math.min(want.k, 32)`. Nothing else.
16. `e2e/suites/glass-ceremony.ts`: `import { REDRAFT_TRIES } from "./zoom/kit.ts";` and `waitRedraft` loops `i < REDRAFT_TRIES`; its comment keeps pointing at `waitRedraft` in `e2e/suites/zoom/kit.ts`.
17. `e2e/suites/region-detail.ts` (Test E7): `LINK`'s `k=8` becomes `k=32`; `import { REDRAFT_TRIES } from "./zoom/kit.ts";` and both waits loop `i < REDRAFT_TRIES`; `rd1Ladder`, `rd2CoastGains`, `rd3SameBytes`, `rd5SharedLink`.
18. `e2e/suites/chart-drawer/reads.ts`: after `DEEP`, `export const DEEPEST = "cx=0.5625&cy=0.4375&k=32";`, with no comment (CD63 pins that it commits a band-5 inset).
19. `e2e/suites/chart-drawer/desk.ts`: `DEEPEST` joins the import from `./reads.ts`; the new `cd63DeepestLays` (Test E8).
20. `e2e/suites/chart-drawer.ts`: after `await step("CD5", () => cd5CuttingOff(kd));`, `await step("CD63", () => cd63DeepestLays(kd));`, and `cd63DeepestLays` joins the import from `./chart-drawer/desk.ts`.

**Lanes**

21. `test/e2e/lane-timings.test.ts`: `MEASURED_SECONDS` for `zoom`, `region-detail` and `chart-drawer`, re-measured from the pull request's own CI lane logs by the procedure in `handbook/specs/site-architecture.md`, the runs and arithmetic in the PR body. No suite moves in `e2e/support/lanes.ts` (Stop condition 6).

**Scripts**

22. `scripts/region-detail/cost.ts` and 23. `scripts/region-detail/probes.ts` (Design 8).

**Doctrine and ledger** (wording under Rosters and doctrine)

24. `handbook/specs/explorer-doctrine.md`: the hold bullet and "The address is a photograph".
25. `handbook/specs/rulebook.md`: the Issue #395 scheduling bullet's last two sentences.
26. `handbook/errata/guards.md`: one row under `## Ruled and left`, the lens at 96 (D5).
27. `handbook/errata/site.md`: the PR #452 crossing row moved from `## Open` to `## Ruled and left` (D4), and one new row there, the links at band 5 (D3).
28. `handbook/specs/chart-dress.md`: one paragraph, the scale bar's leagues (D1).

The glossary's League entry (`src/pages/glossary/index.astro`) stays as it is: "Vellum's scale bars are ruled in leagues" holds under the ruled bar.

**Plan**

29. `handbook/plans/954/954-plan.md`: this plan, copied unchanged.

## Tests, in the order they are written

Every unit red is read with `node --test <file>` at the first commit. "Prover" marks the guards `vellum-guard-prover` gets at step 11 with the mutations named. The e2e checks are proved by the implementer (workflow step 15) or sent to the proof runner (`npm run proof`) with their suite named.

### Unit, first commit (red on the assertion, against the stubs in Files)

The values below were checked against the spike's six-band table by the planner (`bandFor`, `decideSettle`, `latticeFromSettle`, `latticeFromCentre`, `parseTable`, `tableWindow`).

**U1** `test/world/lod.test.ts`, the first test, renamed `"LOD_BANDS: six bands to the ruled depth, band 5, sizeUV = 1/k, grid fixed at 320x240 (Issue #954)"`: `assert.equal(LOD_BANDS.length, 6)`; the `isRegion` message `"band 0 is the world sheet; 1..5 are regions"`; the k ladder `[1, 2, 4, 8, 16, 32]` with the message `"the k ladder is 1,2,4,8,16,32"`; and two lines, `assert.equal(DEEPEST_K, 32, "the Glass's ceiling is the deepest band's k");` and `assert.equal(DEEPEST_K, (LOD_BANDS[LOD_BANDS.length - 1] as (typeof LOD_BANDS)[number]).k);`. `DEEPEST_K` joins the import. Red: length 4. Prover; mutations: the band-5 entry deleted; `DEEPEST_K = 8`; `DEEPEST_K = (LOD_BANDS[3] as LodBand).k`.

**U2** `lod.test.ts`, "bandFor with no current band": add `assert.equal(bandFor(16.0), 4, "at the k=16 rung");` and `assert.equal(bandFor(32.0), 5, "at the k=32 rung");`; `bandFor(100)` is 5. Red: `bandFor(16)` is 3.

**U3** `lod.test.ts`, "bandFor is hysteretic": add `assert.equal(bandFor(10.7, 3), 3, "held below at the 3/4 boundary");`, `assert.equal(bandFor(10.7, 4), 4, "held above at the 3/4 boundary");`, `assert.equal(bandFor(21.4, 4), 4, "held below at the 4/5 boundary");`, `assert.equal(bandFor(21.4, 5), 5, "held above at the 4/5 boundary");`. Red: `bandFor(10.7, 4)` clamps to 3.

**U4** `lod.test.ts`, "climbs one band at a time": the walk `[1.0, 1.5, 1.7, 3.0, 3.3, 6.0, 6.5, 12.0, 13.0, 24.0, 26.0]`, expected `[0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5]`. Red at 13.0.

**U5** `lod.test.ts`, "drops one band at a time": `let band = 5;`, the walk `[24.0, 20.0, 12.0, 10.0, 6.0, 5.0, 2.6, 2.5, 1.3, 1.2]`, expected `[5, 4, 4, 3, 3, 2, 2, 1, 1, 0]`. Red: the first step clamps to 3.

**U6** `lod.test.ts`, the multi-band test: `bandFor(8, 0)`'s message becomes `"a fast zoom from home to k 8 lands directly on band 3"` and `bandFor(1, 3)`'s `"a fast zoom-out from band 3 lands home"`; add `assert.equal(bandFor(32, 0), 5, "a fast zoom from home lands directly at the finest band");` and `assert.equal(bandFor(1, 5), 0, "a fast zoom-out from the finest band lands home");`. Red: `bandFor(32, 0)` is 3.

**U7** `lod.test.ts`, new after "decideSettle: a partial zoom-out steps down ONE region band": `"decideSettle: a camera at the ceiling commits band 5 on its own 1/32 lattice window (Issue #954)"`: `const d = decideSettle({ camera: { cx: 0.5, cy: 0.5, k: 32 }, currentWindow: FULL_WINDOW, currentBand: 0 }); assert.equal(d.action, "region"); if (d.action === "region") { assert.equal(d.band, 5); assert.deepEqual(d.window, lodWindowFor(0.5, 0.5, 1 / 32)); }`. Red: band 3.

**U8** `test/explorer/camera.test.ts`: `addressCamera` joins the import from `../../src/site/explorer/camera.ts` and `DEEPEST_K` is imported from `../../src/world/lod.ts`; a module-level `const at = (h: string) => addressCamera(new URLSearchParams(h), DEEPEST_K);`; new `"a shared link's camera is read up to the deepest band's k, 32, and refused past it (Issue #954)"`: `assert.deepEqual(at("cx=0.5&cy=0.25&k=32"), { cx: 0.5, cy: 0.25, k: 32 }); assert.deepEqual(at("cx=0.5&cy=0.25&k=8"), { cx: 0.5, cy: 0.25, k: 8 }); assert.equal(at("cx=0.5&cy=0.25&k=32.0001"), null); assert.equal(at("cx=0.5&cy=0.25&k=0.99"), null);`. Red: the first deepEqual (the stub `DEEPEST_K` is 8). Prover; mutations: `camera.k <= ceiling` to `camera.k <= 8`; `<=` to `<`; the upper bound deleted; `>= 1` deleted. The issue's mutation, a literal put back in `readHash`, is RD5's to catch (Design 2).

**U9** `camera.test.ts`, new `"a link missing a key, or carrying one that is not a number, carries no camera (the parse readHash made, moved, Issue #954)"`: `assert.equal(at("cx=0.5&k=2"), null); assert.equal(at("cy=0.5&k=2"), null); assert.equal(at("cx=0.5&cy=x&k=2"), null); assert.equal(at(""), null);`. Green from the first commit (it pins the moved parse). Prover; mutations: the `=== null` line deleted (a missing `cy` reads `Number(null)`, 0, so `cx=0.5&k=2` becomes a camera); `const finite = true`.

**U10** `test/site/table-address.test.ts`: `RUNGS` joins the import; new `"the table's rungs are the Glass's region bands, every one (Issue #954)"`: `assert.deepEqual([...RUNGS], LOD_BANDS.filter((b) => b.isRegion).map((b) => b.index));`. Green at the first commit (`[1, 2, 3]` both sides) and after; its red comes from a mutation. Prover; mutations: `RUNGS = [1, 2, 3, 4]`; a seventh `LOD_BANDS` entry with `RUNGS` unchanged.

**U11** `table-address.test.ts`, `"the rung is the Glass's, 1 to 3: band 0 is a world sheet and no survey at all"` renamed `"the rung is the Glass's, 1 to 5: band 0 is a world sheet and no survey at all, and band 6 does not exist (Issue #954)"`: the refused list `["0", "6", "-1", "2.5", "abc"]`, the accepted loop `for (const rung of [1, 2, 3, 4, 5])`. Red: rung 4 parses to nothing. Prover; mutation: `RUNGS` back to `[1, 2, 3]`.

**U12** `table-address.test.ts`, `"a lattice index off the lattice drops the item"`: `for (const rung of [1, 2, 3])` becomes `for (const rung of RUNGS)`. Green at the first commit; it sweeps rungs 4 and 5 once the second commit lands.

**U13** `table-address.test.ts`, `"THE LATTICE CONTRACT"`'s seat sweep: `for (const rung of [1, 2, 3] as const)` becomes `for (const rung of RUNGS)`. Measured on the spike: rung 4's 16,641 seats in 7 ms and rung 5's 66,049 in 22 ms, every seat holding.

**U14** `table-address.test.ts`, the control `"the sheet-fraction camera names a different seat"`: the list gains `[4, 0.2]` and `[5, 0.2]` (measured on the spike: rung 4 seats 22 against 26, rung 5 44 against 51). Red at the first commit: both sides are null at rungs 4 and 5, and `notDeepEqual(null, null)` fails.

**U15** `test/site/chart-drawer.test.ts`: `surveyItemFrom` joins the import from `../../src/site/explorer/chart-drawer.ts`, `LOD_BANDS` and `lodWindowFor` the import from `../../src/world/lod.ts`; new `"CT12 a settle at any region band is gathered, band 5 the deepest, and none at the world sheet or past the table (Issue #954)"`: `const settle = (band: number) => surveyItemFrom({ seed: 42, overrides: undefined, render: { style: "antique" }, band, seat: { lx: 3, ly: 4 } });` then `assert.equal(settle(5)?.rung, 5, "band 5, the ruled depth"); for (const b of LOD_BANDS.filter((x) => x.isRegion)) assert.equal(settle(b.index)?.rung, b.index, \`band ${b.index}\`); assert.equal(settle(0), null); assert.equal(settle(LOD_BANDS.length), null);`. Red: `settle(5)` is null. Prover; mutations: the gate back to `c.band < 1 || c.band > 3`; `!isRung(c.band)` replaced by `c.band < 1` (no upper bound).

**U16** `chart-drawer.test.ts`, new `"CT13 a rung-5 sheet carried in the address redraws its own band-5 window (Issue #954)"`, with `parseTable` from `../../src/site/shared/table-address.ts`, `hashOf` from `../../test-support/table-address-fixtures.ts` and the type `RegionJob` from `../../src/site/explorer/worker-client.ts` joining the imports where absent: `const [item] = parseTable(hashOf("k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-5.lx-131.ly-105")) ?? []; assert.ok(item && item.kind === "survey", "a rung-5 survey parses");` and then `const job = thumbJobFor(item) as RegionJob; assert.equal(job.band, 5); assert.deepEqual(job.window, lodWindowFor(131 / 256, 105 / 256, 1 / 32));` (the spike gives `u0 0.49609375, v0 0.39453125`). Red: no item. Prover; mutation: `tableWindow` reading `LOD_BANDS[Math.min(item.rung, 3)]`.

**U17** `test/render/region-scalebar.test.ts`, for the ruled bar (Design 5). `numericTicks`' filter `/^\d+(\.\d+)?$/` becomes `/^(\d+|[½¼])$/`, so a fraction glyph counts as a tick and the italic caption still does not; the test `#249: the deepest-band region scale bar fits within the frame` is otherwise unchanged. Three tests:

- **S1**, red at the first commit, `"Issue #954: on the two windows Issue #954 opens, 1/16 and 1/32, the scale bar's ticks stand inside its claimed box"`: for `size` of `1 / 16` and `1 / 32`, `const w = generateRegionWorld(world, { window: windowAround(world, world.settlements[0]!, size), gridW: 320, gridH: 240, title: "A Survey" });` (not through `LOD_BANDS`, which has no such band at the first commit), and every numeric tick's `x <= plan.box.x + plan.box.w` (305 on the 1500 px sheet). Red: band 4's window's last tick at 391.
- **S2**, `"#249: every region band's scale bar fits within the frame"` strengthened and renamed `"#249, Issue #954: every region band's scale bar has its ticks inside its claimed box, so its labels stay on their paper"`, the same assertion over every region band of `LOD_BANDS`; green at the first commit, red at the second (bands 4 and 5 join and overrun), green at the third. The box is the bound because the paper runs 8 px past it (`scalebarLayer`'s backing rect) and the widest tick label measured on any arm is 10 px (`out/954/stills-report.md`), so a tick inside the box keeps its label's ink on the paper. `numericTicks` returns the plan beside the ticks (`const plan = planScalebar(ctx);`).
- **S3**, replacing `#249: region scale-bar tick labels stay whole numbers (no fractional mid tick)`: `"Issue #954: a region scale bar's ticks are whole leagues to band 3, and below it a half or a quarter printed as its own glyph (Alex, 2026-10-23)"`, asserting each region band's tick texts in x order exactly: band 1 `["0", "5", "10"]`, band 2 `["0", "2", "4"]`, band 3 `["0", "1", "2"]`, band 4 `["0", "½", "1"]`, band 5 `["0", "¼", "½"]`, read off `LOD_BANDS`' region bands with `regionOfBand`. Red at the first commit: `LOD_BANDS` has no band 4 to read, so the test asserts first that the region bands' count is 5 (`"the bar is read at every band the Glass draws, 1 to 5"`), which reds on 3; after the second commit it reds on band 4's `"2"` (today's total); green at the third.
- Prover, on S1, S2 and S3; mutations: `FRACTIONS` dropped from `scalebarLabel` (band 4 prints `0.5`); `0.5` removed from `REGION_NICE_TOTALS` (band 5 falls back to 1 league, 301 px, past the box); `FRACTIONS["0.25"]` set to the half glyph.

### e2e (written after the unit commits)

**E1** Z2 (File 10). Its red: `GLASS_MAX` at 8 reads `k` 8.

**E2** `bands.ts`: a module constant `const RANK = "{capital:0,seat:1,town:2,village:3,hamlet:4,farmstead:5,mill:5}";`; in `z21HamletsRead`'s payload `const RANK={capital:0,seat:1,town:2,village:3,hamlet:4};` becomes `` `const RANK=${RANK};` ``; `z21Target`'s payload imports `{hamletCandidates,HAMLET_MAX_WINDOW_UV}` from `/explorer/engine/society/hamlets.js` and `{quantizeCenter,lodWindowFor}` from `/explorer/engine/world/lod.js`, and `const size=LOD_BANDS[LOD_BANDS.length-1].sizeUV;` becomes `const size=HAMLET_MAX_WINDOW_UV;`; Z21's title becomes `"Z21 hamlets: band 3, the first band the smallest tier grows on, engine count/name parity over the stamped window, tier order held"`. Why the scout moves: left at the last band, it scouts 1/32 windows, of which seed 42 has none with 8 hamlet candidates (3 at most).

**E3** Z21c, new in `bands.ts`:

```ts
const CAPITAL_DEEPEST =
  `(async()=>{const {defaultRecipe,generateWorld}=await import("/explorer/engine/world/generate.js");` +
  `const {quantizeCenter,LOD_BANDS}=await import("/explorer/engine/world/lod.js");` +
  `const {marginFor}=await import("/explorer/engine/render/transform.js");` +
  `const world=generateWorld(defaultRecipe(42,{gridW:320,gridH:240}));const s=world.settlements[0];` +
  `const q=quantizeCenter(s.x/(world.recipe.gridW-1),s.y/(world.recipe.gridH-1),LOD_BANDS[LOD_BANDS.length-1].sizeUV);` +
  `const svg=document.querySelector("#map > svg");const vb=svg.getAttribute("viewBox").split(" ").map(Number);` +
  `const m=marginFor(vb[2]);const mx=m/vb[2],my=m/vb[3];` +
  `return {cx:mx+q.cx*(1-2*mx),cy:my+q.cy*(1-2*my),name:s.name};})()`;
```

`z21cRead({ evaluate })` reads the LAST `#map .region-inset svg` (`[...document.querySelectorAll("#map .region-inset svg")].pop()`) and returns: `detail`, its `data-vellum-region-detail`; `farms`, the count of its `g.settlement[data-tier="farmstead"]` and `g.settlement[data-tier="mill"]`; `expected`, the same two kinds counted in `generateRegionWorld(world,{window:win,gridW:320,gridH:240,title:"parity",detail:true}).settlements`, with `win` read from the inset's four `data-vellum-region-*` attributes as `z21HamletsRead` reads them; `namesMatch`, every one of those marks' `dataset.name` an engine name; `ordered`, the tiers in DOM order non-decreasing under `RANK`; `known`, every tier a key of `RANK`; `outside`, the two kinds counted on `#map > svg`; and `dry`, the dry-in delay each tier's name takes, read by forcing the ceremony's classes in the same task: on that svg add `redrafting` if it is absent, on the first `g.settlement` of each of the tiers `capital`, `hamlet`, `farmstead` and `mill` add `dry-in` if it is absent, read `getComputedStyle(g.querySelector("text")).animationDelay` for each into `dry` (`{ capital, hamlet, farmstead, mill }`, `null` for a tier the sheet lacks), then remove exactly the classes it added. `z21cFarmsteads` does `const target = await evaluate<{ cx: number; cy: number; name: string }>(CAPITAL_DEEPEST, true); const before = (await rgn()).redrafts; await enterAt(32, target.cx, target.cy); const deep = await waitRedraft(before);`, the same 50-try `insetView` poll Z21 makes, `await shoot("explorer-farmsteads-band5.png");`, the read, and

```ts
check(
  "Z21c the Glass at its ceiling, k 32, commits band 5: the inset stamps detail 5, draws the farmsteads and mills the engine places on the stamped window, name for name, after every other tier, and their names dry in when the hamlets' do (Issue #954)",
  deep.band === 5 &&
    r.detail === "5" &&
    r.farms! >= 3 &&
    r.farms === r.expected &&
    !!r.namesMatch &&
    !!r.ordered &&
    !!r.known &&
    r.outside === 0 &&
    !!r.dry &&
    r.dry.hamlet !== null &&
    r.dry.hamlet !== "0s" &&
    r.dry.capital !== null &&
    r.dry.capital !== r.dry.hamlet &&
    r.dry.farmstead === r.dry.hamlet &&
    r.dry.mill === r.dry.hamlet,
  JSON.stringify({ band: deep.band, ...r, target }),
);
```

The fixture is measured: seed 42's capital Laukuwelua at band 5 holds the capital, 1 hamlet, 9 farmsteads and 1 mill, so every tier the read names is there; the capital is the control, its name drying in at the 260 ms base delay where a hamlet's waits 740 ms. Its reds: `LOD_BANDS` without band 5 (the camera clamps at 8, `deep.band` 3); the `[data-tier="farmstead"]` arm deleted from the dry-in rule in `src/styles/explorer/index.css` (the farmstead's name takes the 260 ms base).

**E4** `hold.ts`, the ceiling reads: `CEILING`'s payload asks `window.__vellumZoomTo({k:200,x:W/2-100*W,y:H/2-100*H})`, and its comment line becomes `// Asks for 200 and goes straight home in the same task, so no settle runs at the deep camera and nothing is drafted.`; `homeCheck` asserts `r.ceiling === 32`; the ZH4a to ZH4d titles say `the ceiling back at 32`. Red: `GLASS_MAX` at 8.

**E5** `hold.ts`, ZH6 and ZH7:

- `FIRST_HAMLET` is replaced by

  ```ts
  const FIRST_LABEL = (name: string | null): string =>
    `(()=>{const gs=[...document.querySelectorAll('#map .region-inset svg g.settlement')];` +
    `const g=gs.find((x)=>x.querySelector("text")&&(${JSON.stringify(name)}===null||x.dataset.name===${JSON.stringify(name)}));` +
    `return g?{name:g.dataset.name,h:g.querySelector("text").getBoundingClientRect().height}:null;})()`;
  ```

- `zh6HeldCeiling`: `enterAt(6.5, ...)` becomes `enterAt(DEEPEST_ENTRY, ...)`; right after its `waitRedraft`, `const entered = await read(k);`; both `enterAt(24, ...)` become `enterAt(96, ...)`; `FIRST_HAMLET` becomes `FIRST_LABEL`; `const want = 96 / DEEPEST_ENTRY;`; the check `entered.band === 5 && entered.committed && deep.k === 96 && !!big && Math.abs(big.h / rest.h / want - 1) < 0.02 && hashed.hashK === "32.0000" && letGo.glide && Math.abs(back.k - 32) < 1e-6 && back.band === 5 && back.committed && back.pressed === "false" && unheld.k === 32`; title `"ZH6 held, the camera reaches 96 and a label is 96 / 28 times its first size, the address says 32, letting go glides back to 32 on band 5, and unheld 96 lands on 32 (Issue #751, Issue #954)"`. The dated comment above the ratio becomes one line: the date of the implementer's first green local run, that run's `big.h` and `rest.h` from the check's own payload, and `a growth that tracked a ceiling of 32 would read 1.14, so 2% is headroom for label rounding and nothing else`.
- `zh7LetGoMidGlide`: `enterAt(6.5, ...)` becomes `enterAt(DEEPEST_ENTRY, ...)`, `enterAt(24, ...)` becomes `enterAt(96, ...)`; the check reads `lit.k === 96`, `now.k === 96`, `Math.abs(rest.k - 32) < 1e-6`; title `"ZH7 letting go while a glide out from above 32 is in flight lands the camera on 32, not further out (Issue #751)"`; its comment's arithmetic becomes `the camera is still at 96 and "Stand off" has queued a glide toward 96 / 1.4 when the let-go reads it, the case where reading the camera instead of the glide's pending target lands at 96 / 1.4 * 32 / 96 = 22.86`.
- ZH8's title says `toward a depth at or under 32` for `toward a depth at or under 8`; its check is unchanged.
- Red: `HOLD_STRETCH` 1 (deep.k 32).

**E6** `registration.ts`:

- `DEPTH`, `TOLERANCE_PX`, `WITNESS_PX`, the line above them and the ZH10a to ZH12 titles are unchanged (C8).
- `deep()`'s predicate reads `d.hashK === "24.0000"`: a camera held at 24 is now under the Glass's ceiling, so the address carries 24 itself.
- `PICK_WINDOW` imports `{hamletCandidates,HAMLET_MAX_WINDOW_UV}` from `/explorer/engine/society/hamlets.js` and `{quantizeCenter,lodWindowFor,insetSheetRect}` from `/explorer/engine/world/lod.js`, and `const size=LOD_BANDS[LOD_BANDS.length-1].sizeUV;` becomes `const size=HAMLET_MAX_WINDOW_UV;`.
- ZH14 and ZH14b assert `ceiling === 32` and their titles say `the ceiling stays at 32`.
- Reds: the scout left at the last band (`pick.e` 0, so ZH10b's `pick.e >= WITNESS_PX` fails); `GLASS_MAX` at 8 for ZH14 and ZH14b; the address capped at 8 again for `deep()` (its settle throws inside the step).

**E7** `region-detail.ts`:

- `rd1Ladder`'s list becomes `[[1, 2], [2, 4], [3, 8], [4, 16], [5, 32]] as const`; title `"RD1 the band ladder stamps the detail it drew: bands 1 to 5 read 1 to 5 on the committed inset (#400 AC1, AC2, Issue #954)"`.
- `rd2CoastGains`'s title says `the band-5 sheet on screen` for `the band-3 sheet on screen` (measured: seed 2's band-5 window there draws 3 shore rings detailed against 1 bare, so `detail > bare > 0` holds).
- `rd3SameBytes`: both `enterAt(8, ...)` become `enterAt(32, ...)`; RD4 reads `panned.band === 5 && neighbour !== null && neighbour.detail === "5" && neighbour.digest !== direct!.digest`.
- `rd5SharedLink`: `linked[0]!.detail === "5"`; title `"RD5 a shared link at the bottom, k 32, round-trips to a byte-identical band-5 draw across a cold reload (#400 AC2, Issue #954)"`.
- Red: `addressCamera`'s bound at 8 (RD5's link opens at home, no inset).

**E8** CD63, new in `desk.ts`:

```ts
export async function cd63DeepestLays({ evaluate, check, settle, go, clickEar }: DrawerKit): Promise<void> {
  await go(`${DRESS}&${DEEPEST}`);
  await settle(READ, atInset, "chart-drawer-deepest-inset", DRAWN);
  await clickEar();
  const laid = await settle(READ, (d) => d.open && d.cuttings === 1, "chart-drawer-deepest-laid", DRAWN);
  const carried = laid.hashTable ?? "";
  await go(`${DRESS}&table=${carried}`);
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  const filled = await settle(READ, (d) => d.imgs >= 1 && d.decoded.every(Boolean), "chart-drawer-deepest-filled", DRAWN);
  check(
    "CD63 a survey laid from the Glass's deepest band is carried in the address as rung 5, and a reload redraws it from the address alone (Issue #954)",
    /(^|\.)rung-5\./.test(carried) && filled.cuttings === 1 && filled.imgs === 1 && filled.decoded[0] === true && filled.titles[0] !== "Chart № 42",
    JSON.stringify({ carried, cuttings: filled.cuttings, imgs: filled.imgs, titles: filled.titles }),
  );
}
```

Red: `surveyItemFrom`'s gate back at `c.band > 3` (no sheet is laid; the `laid` settle throws inside its step). CD63 leaves its one sheet in the device's table; the next arrival, CD7's, clears it, since the kit's `go` calls `forget` before every navigation (`drawerKit` in `e2e/suites/chart-drawer/kit.ts`).

## Order of commits

1. `#954 The failing tests: six bands, one ceiling, the Chart Table and the scale bar at band 5`: `handbook/plans/954/954-plan.md`; U1 to U17; the stubs in Files 1, 3 and 5. Push.
2. `#954 The band table reaches band 5, and the Glass, the hold and a shared link read one ceiling`: Files 1 to 7. U1 to U16 green; S1 and S2 red.
3. `#954 The scale bar keeps leagues at bands 4 and 5, marking halves and quarters`: File 8. U17 green.
4. `#954 The zoom suite reads the new ceilings, and the Glass draws band 5's farmsteads at its bottom`: Files 9 to 16.
5. `#954 The region ladder walks to band 5, and a band-5 sheet is laid, carried and redrawn`: Files 17 to 20.
6. `#954 The cost script names the band its cache line measures, and the probes gate hamlets by size`: Files 22 and 23.
7. `#954 The doctrine: one ceiling, the depth and the bar ruled, and the crossing's ledger row closed`: Files 24, 25 and 28, and File 27's move of the PR #452 row.
8. After the pull request opens (its number is in the two new rows) and before the cold skeptic is dispatched: `#954 The ledger: the deep links and the lens at the hold's depth, as ruled`: File 26 with the step-11 plate read's reading, and File 27's new row; `<this PR>` is the pull request's number and `<date>` that day.
9. Once CI's lanes pass on the pushed head: `#954 MEASURED_SECONDS re-measured for the three suites this moves`: File 21.

Each commit ends with the trailer block `CLAUDE.md` gives; the session link is `https://claude.ai/code/session_01LRTjZiwKu5qBHM1mZsUFVk`.

**Before the pull request opens** (workflow steps 12 and 15): file the straight-shores issue exactly as Appendix A gives it, with `gh issue create --repo ahl-gram/Vellum --parent 395 --label epic:fartherinterior --title "<Appendix A's title>" --body-file <scratch file>`, writing the body to a scratch file first (`954-straight-shores.md`) and running the `gh` command alone; read its number back and name it in the step-12 comment and the PR body. Adding it to the roadmap board and to Epic Issue #395's checklist is the dispatcher's, not the implementer's.

## Rosters and doctrine

- **Rosters**: Z21c joins `e2e/suites/zoom.ts`'s run and CD63 joins `e2e/suites/chart-drawer.ts`'s, each by hand. No suite is added, so `E2E_SUITE_ORDER`, `NEEDS_PREDECESSOR`, `OPENS_ON_HOME` (`e2e/support/suites.ts`) and `E2E_LANES` (`e2e/support/lanes.ts`) do not change; the lane balance test checks itself once File 21 lands.
- **`handbook/specs/explorer-doctrine.md`, the hold bullet**: the clause `the camera's ceiling rises from \`GLASS_MAX\` to \`HELD_MAX\` (\`createGlass\` in \`src/site/explorer/glass.ts\`, through \`setScaleMax\` in \`src/site/shared/zoom-controller.ts\`)` becomes `the camera's ceiling rises from \`GLASS_MAX\`, the deepest band's k, to \`HELD_MAX\`, three times it, so the hold magnifies the deepest drawn sheet and never draws a band of its own (\`createGlass\` in \`src/site/explorer/glass.ts\`, through \`setScaleMax\` in \`src/site/shared/zoom-controller.ts\`)`.
- **`explorer-doctrine.md`, "The address is a photograph"**: the sentence `The hold is the reader's and the address never carries it: a link copied while the sheet is held opens unheld at the same centre, no deeper than \`GLASS_MAX\` (\`cameraForAddress\` in \`src/site/explorer/glass.ts\`), so the camera's bound in \`readHash\` stands.` becomes `The hold is the reader's and the address never carries it: a link copied while the sheet is held opens unheld at the same centre, no deeper than \`GLASS_MAX\` (\`cameraForAddress\` in \`src/site/explorer/glass.ts\`). \`GLASS_MAX\` is the deepest band's k (\`DEEPEST_K\` in \`src/world/lod.ts\`), and a shared link's camera is read under that same bound (\`addressCamera\` in \`src/site/explorer/camera.ts\`), so a link written at the bottom reads back at the bottom.`
- **`handbook/specs/rulebook.md`, the Issue #395 bullet**: the two sentences `\`LOD_BANDS\` and the Glass \`scaleExtent\` move LAST, in Sub 4, only after the layers agree. The held sheet's higher ceiling (Issue #751) magnifies a sheet already drawn and adds no band, so it does not wait on that sub.` become `**The Glass descends to band 5 and no further**: \`LOD_BANDS\` in \`src/world/lod.ts\` ends there, and a deeper band is a separate ratification under the ceiling above. The held sheet magnifies the deepest drawn sheet three times and adds no band.`
- **`handbook/specs/chart-dress.md`**, a new paragraph after the one beginning `**A river keeps its name over a graze.**`: `**A scale bar is ruled in leagues at every band.** Where two leagues outrun the bar's claimed box, a close-up's bar totals one league or a half and marks its halves and quarters with their own glyphs, never a second unit (\`REGION_NICE_TOTALS\` and \`FRACTIONS\` in \`src/render/layers/scalebar.ts\`), and every tick stands inside the box the bar claims before any label runs.`
- **`handbook/errata/guards.md`**, a new row at the end of `## Ruled and left`: `- PR #<this PR> (<date>, medium): \`zl3LensRegisters\` in \`e2e/suites/zoom/loupe.ts\` holds the lens to the camera within \`SHIFT_PX\` (1 px) at 24 times only, while the hold now reaches 96; measured at Issue #954's step 6 (seed 42, a held band-5 sheet, camera 48, lens 96): the best shift 2 px (dx -2, dy -1), correlation 0.85, and at its step 11 <the plate reader's reading>. Ruling: Alex, 2026-10-23, Issue #954 comment 6374207607: "Ship as is, re-measure at the end". Searched \`handbook/errata/\` and the open issues for zl3 and loupe registration, which find nothing.` `<the plate reader's reading>` is replaced by the step-11 plate read's best shift and correlation at the same depths, in the same form (commit 8; Stop condition 11). The row is written before the PR body is final, so the body names it.
- **`handbook/errata/site.md`, the PR #452 row**: deleted from `## Open` and inserted in `## Ruled and left` between the `PR #330` row and the `PR #467` row, unchanged except that its last two sentences (from `Left by the author:` to the end) become `Ruling: Alex, 2026-10-23, Issue #954 comment 6374207607: "Accept it, close the ledger note", on the window measured at Issue #954's step 6 at 110 to 111 ms at band 3's crossing and 114 to 134 ms at the two new ones (two runs each). Searched: Issue #954's item 4, which named this window, is where it was ruled.`
- **`handbook/errata/site.md`**, a new row at the end of `## Ruled and left`: `- PR #<this PR> (<date>, high): a link copied at band 5 reopens one lattice step, an eighth of the window, from the survey it was copied on 1.20% of the time (0.48% at band 3 before this pull request), since \`writeHash\` in \`src/site/explorer/hash-sync.ts\` writes the camera's centre at 4 decimals (Issue #954's step 6: 200,000 random cameras a band; at 6 decimals, none). Ruling: Alex, 2026-10-23, Issue #954 comment 6374207607: "Keep links as they are", re-ruling the issue's acceptance line "A link copied at the bottom opens at the bottom and redraws the same bytes" to hold for about 98.8% of links. Searched the open issues for link precision and 4dp, which find nothing.`
- **The private memory** may quote the old ceilings; that is the dispatcher's to sweep at handoff, never this pull request's.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`.
- The unit reds at the first commit: `node --test test/world/lod.test.ts test/explorer/camera.test.ts test/site/table-address.test.ts test/site/chart-drawer.test.ts test/render/region-scalebar.test.ts`, each red line pasted into the PR body's guard table.
- The golden and the committed charts unmoved: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts` green and `git diff --stat origin/main -- src/static/` empty. No regen is owed: every change is region-only or site-only.
- The unit cost: `node --test test/site/region-detail-wiring.test.ts` timed at `origin/main` and at the head (Stop condition 7).
- e2e, locally one suite at a time and never the full lanes: `E2E_SUITES=zoom npm run test:e2e`, then `glass-ceremony`, `region-detail` and `chart-drawer` the same way; `corners` is untouched and left to CI.
- `node scripts/region-detail/cost.ts` once, its band labels pasted (bands 1 to 5, the cache line at band 3).
- `vellum-plate-reader` at step 11 (owed): the ladder from band 0 to 5 at full scale and 1:1 crop on seed 42's capital and seed 2's region-detail target; the crossings 3 to 4 and 4 to 5; the caption's ms for a first descent, a pan and a link at the bottom; the loupe at the bottom, with the lens against the camera at 96 (a held band-5 sheet, camera 48) by ZL3's method, the re-measure Alex ruled for D5; the hold at 96, with the towns' and hamlets' registration read there by ZH10's method; the farmstead and mill names drying in on a live band-5 redraft; the Chart Table drawer and the Portfolio of a deep table; the scale bar as ruled at bands 3, 4 and 5 at 1500 and at the Explorer's 832, against the ruled stills `out/954/scalebar-shots/a-half-leagues--b*` for the fidelity rule. No Print Room plate.
- The PR body states, under the acceptance it covers: the link acceptance is re-ruled by D3 (Issue #954 comment 6374207607) to hold for about 98.8% of links copied at band 5, with the 1.20% and 0.48% measurement and the `handbook/errata/site.md` row that records it; RD5's fixed link at k 32 is the check that the rest hold. It names the straight-shores issue filed under Appendix A, the D4 and D5 ledger rows, and the D1 ruling that overturned Issue #249's whole-number rule.
- `vellum-guard-prover` on U1, U8, U9, U10, U11, U15, U16, S1, S2 and S3, and on the existing hamlet guard in `test/world/region.test.ts` with the mutation the issue names (`regionPeople` gating hamlets on `LOD_BANDS[LOD_BANDS.length - 1].sizeUV`, 1/32 after this pull request, so band 3's windows grow none).

## Calls made

C1. **The ceiling's one home is `DEEPEST_K` in `src/world/lod.ts`, and `HELD_MAX` is `3 * GLASS_MAX`.** Rule: `handbook/specs/conventions.md`, "Exactly one home is normative"; the issue asks for the ceiling read in one place; Alex ruled the stretch.
C2. **The link parse moves into `camera.ts` as `addressCamera`, with the ceiling handed in.** Rule: `handbook/specs/check-placement.md`, a unit test runs code, and `readHash` reads the DOM; Issue #161's boundary (`test/site/hunt-zoom.test.ts`), since the Daily Hunt imports `camera.ts`; a module of its own would be a new file, a naming call of Alex's (`vellum-footguns`, "Defaults this repo has already ruled").
C3. **`RUNGS` is the table's one gate, held to `LOD_BANDS` by a test.** Rule: `check-placement.md`, "Make a wrong state unrepresentable"; Gate 1 item 16.
C4. **No hamlet change.** Rule: recon; `handbook/specs/region-and-voyage.md` keys the tiers to named sizes.
C5. **No Print Room plate in the plate read.** Rule: Issue #950 comment 6330451217.
C6. **The other rooms' `scaleExtent: [1, 8]` stay**, the Portfolio's included. Rule: they magnify a drawn plate and run no level of detail; the issue's ceiling is the Glass's and a shared link's.
C7. **A check keeps its depth unless it is about a ceiling** (Design 6). Rule: the issue's "decided as meaning the ceiling or a fixed depth, check by check"; a fixed-depth check moved deeper costs a band-5 draw and guards nothing new.
C8. **The registration checks (ZH10a to ZH12) keep their band-3 sheet and their depth, 24, and their 3 px bound.** Rule: `CLAUDE.md`, "A bound is derived": the depth-multiplied defect they exist for stands 6 px or more off at 24 already (the line at their constants), so 24 sees it, while at 96 a 3 px bound flakes (2.76 px measured) and a depth-scaled one passes fixed offsets that fail at 24 today. The 96 reading is the plate reader's, at step 6 and again at step 11.
C9. **ZL3 keeps its depth (lens 24).** Rule: as C8; its 1 px bound was set at 24, and the one reading at 96 is D5.
C10. **The wait budget stays 15 s and gets one home.** Rule: Gate 2 item 8; Design 7.
C11. **Z21c and CD63 are the driving checks for two acceptances** (each new band draws its ruled layers; the Chart Table gathers, carries and redraws a deepest sheet). Rule: Gate 1 item 20.
C12. **No committed band-5 pin for Mara.** Rule: the rule's home is `filledIsoRings` in `src/terrain/contours.ts`, pinned by its own tests and witnessed at bands 3 and 4; band 5 adds no code path.
C13. **The square coast is measured and put to Alex, not fixed here.** Rule: Issue #954 comment 6341268473; the epic's non-goals. Ruled as D2: filed as Appendix A's issue.
C14. **One pull request.** Rule: Alternatives 10.
C15. **Merge order.** Issue #1003 merged as PR #1033 (`6ee3c502`) and this plan is recorded on top of it. Issue #1034 (the slide-away on seven rooms) builds beside this one in `src/site/shared/`, the room seats, `e2e/support/` (`suites.ts`, `suite-map.ts`, `lanes.ts`) and `test/e2e/lane-timings.test.ts`. This plan touches no file under `src/site/shared/` or `e2e/support/`; the one file the two share is `test/e2e/lane-timings.test.ts`, where this plan edits only three lines of `MEASURED_SECONDS`, `zoom: 211.8,`, `"chart-drawer": 210.2,` and `"region-detail": 44.1,`, and the second to merge keeps both edits. If Issue #1034 merges first and moves any of those three values, this pull request re-measures them from its own jobs after `git merge origin/main`, by the procedure File 21 names, since its jobs then run main's change too. `src/site/explorer/glass.ts`, `camera.ts`, `src/site/shared/table-address.ts` and `e2e/suites/zoom/*` are this plan's alone.
C16. **The held 96 showing the world sheet near a band-5 window's edge is not a defect of this sub.** Rule: measured; the window-to-view ratio is today's at 24 over band 3, which the 3x stretch keeps by construction.
C17. **A mark that is a mill in one band-5 window and a farmstead in an overlapping one is the ruled behaviour**, not a defect this sub owes. Rule: `handbook/specs/region-and-voyage.md`, the farmstead bullet ("whether it is one can differ between two overlapping windows"); its feel is Issue #955's post-use docket.
C18. **`DRAWN` in `e2e/suites/chart-drawer/reads.ts` stands as it is**, 400 polls of 50 ms. Rule: it is not one of the budgets the issue names (the three `waitRedraft`s and `waitInset`), and CD63's slowest wait, a cold band-5 draw, is 1.78 s locally and 5.9 s at CI's 3.3, under a third of its 20 s.
C19. **Issues #955, #966, #973 and #976 are untouched and out of scope.** Issue #955 (the post-use re-review) waits on this sub; Issue #966 (fords) designs its mark against band 4 and 5 sheets and gains from this landing first; Issue #973 (terrain marks over names, measured at band 5) and Issue #976 (harbour hamlets off the water, 4 of 4 at 1/32) are defects this sub puts in front of readers at the new depths, each on its own issue.
C20. **Z21c reads the dry-in delay by forcing the ceremony's classes**, the one read of the farmstead and mill dry-in rule that Issue #954 comment 6354473810 said no test reaches. Rule: `handbook/specs/check-placement.md`, what the browser computes is read in a browser; forcing the classes reads the cascade without racing the ceremony's own timing.
C21. **The bar's totals drop the spike's unused quarter league, and the glossary stays.** Rule: no dead code (`vellum-footguns` Gate 5 item 1), and the output at every band 1 to 5 is the ruled still's; "ruled in leagues" stays true under the ruled bar.
C22. **The overturned whole-number rule gets a home in `handbook/specs/chart-dress.md`.** Rule: `CLAUDE.md`, a rule change edits the spec that owns the rule; the old rule lived only in a test, and a ruled appearance that reverses one is the line a later session would otherwise "fix" back.

## The rulings, folded

Alex ruled all five on 2026-10-23 (Issue #954 comment 6374207607); his words are the option labels quoted.

- **D1, "Leagues, with halves and quarters".** Not the planner's recommendation (miles below band 3). Built as Design 5; tested by U17's S1 to S3; the whole-number test is replaced by S3; the rule's new home is the `handbook/specs/chart-dress.md` paragraph (C22). The ruled stills are `out/954/scalebar-shots/a-half-leagues--b4--1500-crop.png`, `a-half-leagues--b5--1500-crop.png` and `a-half-leagues--b4--832-crop.png`; the other arms' stills are not built. The glossary stays (C21).
- **D2, "Open as ruled, file straight shores".** Band 5 opens as ruled; the implementer files Appendix A's issue before the pull request opens (Order of commits); the dispatcher boards it and adds it to Epic Issue #395's checklist.
- **D3, "Keep links as they are".** Not the planner's recommendation (6 decimals). `writeHash` is unchanged; the acceptance line "A link copied at the bottom opens at the bottom and redraws the same bytes in the same environment" is re-ruled to hold for about 98.8% of links copied at band 5 (1.20% reopen one lattice step over; 0.48% at band 3 before this pull request). The PR body states it under that acceptance, and `handbook/errata/site.md` carries it as a ruled row (Rosters and doctrine). RD5 still checks a fixed link at k 32 byte for byte.
- **D4, "Accept it, close the ledger note".** The PR #452 row moves to `## Ruled and left` with the ruling and the step-6 numbers (Rosters and doctrine).
- **D5, "Ship as is, re-measure at the end".** ZL3 keeps its depth; the step-11 plate read re-measures the lens against the camera at 96; the reading joins the ruled row in `handbook/errata/guards.md` (Rosters and doctrine; Stop condition 11).

None of the planner's calls C1 to C20 was overruled (the comment's orchestrator note).

## Open decisions

none.

## Stop conditions

Hand back, with the command and what it printed, when:

1. `git diff --stat 6ee3c502 origin/main` names any code or test file listed under Files.
2. A symbol is not where the plan says: `GLASS_MAX` and `HELD_MAX` in `src/site/explorer/glass.ts`, the `k <= 8` block in `readHash`, `Rung` and `regionBand` in `src/site/shared/table-address.ts`, `surveyItemFrom`'s `c.band > 3`, `FIRST_HAMLET`, `CEILING`, `PICK_WINDOW`, `z21Target`, `RANK`, `lensVersusCamera`'s `Math.min(want.k, 8)`, `rd1Ladder`, `LINK`, `DEEP`.
3. A band-5 settlement mark lacks `data-tier` or `data-name`, or Z21c's fixture draws fewer than 3 farmsteads and mills.
4. ZH6's entry at k 28 commits a band other than 5.
5. A unit red at the first commit reds on anything but its named assertion (a missing export, a type error).
6. After File 21 any lane's share passes `BALANCE_CAP`, or CI's e2e job passes 12 of its 15 minutes.
7. `test/site/region-detail-wiring.test.ts` takes more than 60 s longer at the head than at `origin/main` locally.
8. Z21c's forced dry-in read finds no capital, hamlet, farmstead or mill name on the fixture's sheet.
9. Any golden, hero-chart or `src/static/` difference.
10. The built bar, at any band 1 to 5, differs from the `a-half-leagues` rows of `out/954/scalebar/geometry.txt` (the ruled still's totals, ticks and bar lengths).
11. The step-11 plate read finds the lens off the camera at 96 by more than 2 px on either axis, or a correlation under 0.85, the reading Alex ruled on: that goes back through the dispatcher before the row is written.


## Appendix A: the straight-shores issue (D2), filed by the implementer

The implementer files it before the pull request opens (Order of commits), with the title `Sub 9: Ruler-straight shores on the deepest close-ups - the coast inherits the world map's square cells` and, as its body, everything between the two four-backtick fences below (the fences themselves are not part of the body), copied unchanged into `954-straight-shores.md` in the scratchpad and read back for an em-dash (`grep -n` for U+2014 finds none) before the `gh` call. The planner ran the script in it at `e7437ad0` from a worktree's root, as `node out/straight-shores/measure.ts`, and it printed the six figures the body quotes.

````markdown
**Part of Epic Issue #395 (The Farther Interior). Filed at Alex's ruling of 2026-10-23 on Issue #954's decision D2, "Open as ruled, file straight shores" (Issue #954 comment 6374207607): band 5 opened with the straight shores as they are, and their fix is this issue's. The fix sits in how a close-up's ground is built from the coarser surveys above it, which the epic keeps out until a separate ratification ("no lifting of the band 5-6 ceiling: local guarantee enforcement stays out until a ratified decision says otherwise"), so the first step here is that ratification.**

## What is wrong

On the deepest close-ups the coast runs, in places, as a ruler-straight wall with square corners along a world cell's edge. Measured on the detailed close-up the Explorer draws (the measure below; main `e7437ad0`, and no engine file has changed through `6ee3c502`):

- chart 42's lake shore near world cell (143, 76): the longest straight run is 16, 32 and 63 region cells at bands 3, 4 and 5, painted 62, 135 and 267 px long on the 1500 px sheet and 18, 73 and 148 px at the Explorer's 832;
- across 20 town-centred close-ups (seeds 42, 7, 2, 15 and 23, four towns each), the longest run on a world cell's edge is median 12 and largest 27 at band 3, median 10 and largest 42 at band 4, and median 10 and largest 40 at band 5 (chart 7's Numowopua).

Stills, in Alex's main checkout: `out/954/coast-shots/lake-shore-42--b5--1500-crop.png` beside `out/954/coast-shots/lake-shore-42--b3--1500-crop.png`, and `out/954/coast-shots/numowopua-7--b4--1500-crop.png`. Sub 0's round found it first (Issue #950 comment 6330451217).

## Where it comes from (unproven)

Sub 0's notes name the chain's nearest-cell gate: the parent's cell decides whether a fine cell floors (`gateToParentLand` and `parentCellsOnWindow` in `src/terrain/detail-guarantees.ts`, applied through `floorToParent` there and through `maxOfSurfaces` and `chainedFieldAndGround` in `src/world/detail-chain.ts`), so land that exists only because an ancestor charts it is drawn as that ancestor's square cells. UNVERIFIABLE: no mutation has been run to prove it. The first step of any fix is that proof: switch the gate off for the lake-shore window at band 5 and run the measure again.

## What is not decided

1. Whether to fix it at all. It is the local guarantee enforcement the epic's non-goals keep out (`handbook/specs/rulebook.md`, the Issue #395 bullet), so a fix waits on Alex's ratification.
2. How, if so. A fix changes what every deep close-up looks like, so its directions are drawn as stills beside today's (a design round, `handbook/specs/conventions.md`) before one is built; no direction is ruled.
3. The bound a guard holds. No principle gives how straight is too straight, so the bound is swept first and set above the worst case with its headroom named (`CLAUDE.md`, "A bound is derived").

## The test whose red would prove it

None exists today. The measure below is the instrument; the guard is written with the fix: a unit test asserting that the longest straight run on a world cell's edge at band 5, on chart 42's lake-shore window and on the 20 town close-ups, stays under the ruled bound, red on today's 63.

## The mutation that must bite

Once a fix exists, reverting it (today's gate restored) must turn that guard red on chart 42's lake shore at band 5.

## The command that proves it done

Save the script below as `out/straight-shores/measure.ts` (`out/` is gitignored, so the script travels in this issue) and run `node out/straight-shores/measure.ts` from the repo root. Today it prints the six lines quoted above; the fix is done when every printed run is under the ruled bound.

```ts
// The longest straight stretch of coast on a close-up, along one row or column of its grid, on a world cell's edge and off one. Run from the repo root: node out/straight-shores/measure.ts
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import type { World } from "../../src/world/types.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";

const sizeOf = (band: number): number => 1 / 2 ** band;
const bandWindow = (u: number, v: number, band: number): UvWindow => {
  const q = quantizeCenter(u, v, sizeOf(band));
  return lodWindowFor(q.cx, q.cy, sizeOf(band));
};
const closeUp = (world: World, window: UvWindow): World =>
  generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: regionTitle(world, window), detail: true });

function longestStraight(r: World, world: World): { onEdge: number; offEdge: number } {
  const { w, h } = r.elev;
  const win = r.region!.window;
  const land = (x: number, y: number): boolean => (r.elev.data[x + y * w] as number) > r.seaLevel;
  const perWorldCell = (w - 1) / ((win.u1 - win.u0) * (world.recipe.gridW - 1));
  const onWorldEdge = (pos: number, lo: number, span: number, worldN: number): boolean => {
    const wc = (lo + (pos / (span - 1)) * (win.u1 - win.u0)) * (worldN - 1);
    return Math.abs(wc - Math.floor(wc) - 0.5) * perWorldCell <= 1;
  };
  let onEdge = 0;
  let offEdge = 0;
  const scan = (n: number, m: number, at: (i: number, j: number) => [boolean, boolean], edge: (j: number) => boolean): void => {
    for (let j = 0; j < m - 1; j++) {
      let run = 0;
      let side = 0;
      const on = edge(j);
      for (let i = 0; i < n; i++) {
        const [a, b] = at(i, j);
        const s = a === b ? 0 : a ? 1 : -1;
        run = s !== 0 && s === side ? run + 1 : s !== 0 ? 1 : 0;
        side = s;
        if (on) onEdge = Math.max(onEdge, run);
        else offEdge = Math.max(offEdge, run);
      }
    }
  };
  scan(w, h, (x, y) => [land(x, y), land(x, y + 1)], (y) => onWorldEdge(y + 0.5, win.v0, h, world.recipe.gridH));
  scan(h, w, (y, x) => [land(x, y), land(x + 1, y)], (x) => onWorldEdge(x + 0.5, win.u0, w, world.recipe.gridW));
  return { onEdge, offEdge };
}

const w42 = generateWorld(defaultRecipe(42));
for (const band of [3, 4, 5]) {
  const window = bandWindow(143 / (w42.recipe.gridW - 1), 76 / (w42.recipe.gridH - 1), band);
  const r = longestStraight(closeUp(w42, window), w42);
  console.log(`chart 42's lake shore, band ${band}: on a world cell's edge ${r.onEdge}, off one ${r.offEdge}`);
}
for (const band of [3, 4, 5]) {
  const runs: number[] = [];
  for (const seed of [42, 7, 2, 15, 23]) {
    const world = generateWorld(defaultRecipe(seed));
    const n = world.settlements.length;
    for (const i of new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])) {
      const s = world.settlements[i]!;
      const window = bandWindow(s.x / (world.recipe.gridW - 1), s.y / (world.recipe.gridH - 1), band);
      runs.push(longestStraight(closeUp(world, window), world).onEdge);
    }
  }
  runs.sort((a, b) => a - b);
  console.log(`${runs.length} town close-ups, band ${band}: the longest run on a world cell's edge, median ${runs[Math.floor(runs.length / 2)]}, largest ${runs[runs.length - 1]}`);
}
```

Its output at `e7437ad0`:

```
chart 42's lake shore, band 3: on a world cell's edge 16, off one 19
chart 42's lake shore, band 4: on a world cell's edge 32, off one 16
chart 42's lake shore, band 5: on a world cell's edge 63, off one 19
20 town close-ups, band 3: the longest run on a world cell's edge, median 12, largest 27
20 town close-ups, band 4: the longest run on a world cell's edge, median 10, largest 42
20 town close-ups, band 5: the longest run on a world cell's edge, median 10, largest 40
```

## Cost axis

Region-only: the chain is built for close-ups alone, so world sheets, the golden `1792806240` and the committed charts cannot move, while every close-up the Explorer and the Chart Table draw at bands 1 to 5 may (a band-3 run of 27 cells exists today). No regen, no re-roll.

Filed from Issue #954's plan (`handbook/plans/954/954-plan.md`, Appendix A) before its pull request opened.
````
