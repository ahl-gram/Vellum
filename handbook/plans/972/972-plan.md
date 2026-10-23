# Issue #972: a fill whose ground holds the whole frame takes the frame as its first ring

**Planned at**: `origin/main` `ac7678332cb2b7ba3e6af26eedd7883b6b77e90f`; Issue #972 comments read: 0.
**Rulings**: none yet.
**Open decisions**: none.

## Specs

Read these first, at the sections named, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail": the bullet "A region's coast closes against the window rect, and only the TRUE shore may round" (a bullet is added after it here), and "A region-only change leaves the world sheets byte-identical".
- `handbook/specs/engine-invariants.md`, "What the generator does not do": the border guarantee ("ocean always reaches the border, on all four sides") and the paragraph "The candidate path if the deferral is ever revisited" (one sentence edited here); "Measuring a world in a script" before writing `out/972/render.ts`.
- `handbook/specs/rulebook.md`, "The cost axis and ordering principle" and "Golden and committed-chart discipline": this is a render change that moves no world sheet, so no regen is owed; the drift guard is the command that says so.
- `handbook/specs/chart-dress.md`, "The dress gates what the engine will do": the redraft is antique only, which is why the topographic and nautical changes reach no shipped close-up.
- `handbook/specs/check-placement.md`, "The unit suite".
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" and "How code is cited", for the two spec edits and the errata rows. This plan adds no code comment.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 1, Gate 5 and Gate 6.
- `handbook/errata/README.md`, "A row" and "How a row leaves".

## The defect, measured by the planner at `ac767833`

The probes are throwaway scripts in the planner's scratchpad (`972-census.ts`, `972-witness.ts`, `972-wapauwau.ts`, `972-bare.ts`, `972-world2.ts`, `972-world3.ts`, `972-unit.ts`, `972-rd.ts`, `972-sibling.ts`, `972-types2.mts`); nothing here depends on rerunning them.

- **Cause, confirmed.** `closedIsoRings` (`src/terrain/contours.ts`) closes against the frame only the contour chains that reach it. When every frame vertex stands above the iso no chain reaches it, so the rings are the closed contours round the water inside, and an even-odd fill paints the water and leaves the land bare. `projectedCoastRings` (`src/render/map-renderer.ts`) patches only the field with no ring at all.
- **Census**: 20 seeds (42, 7, 2, 15, 23, 1, 3, 4, 5, 6, 8 to 14, 16, 17, 18), the window of every non-village settlement on its band's lattice, bands 1 to 5, the detailed arm the Explorer draws. Coast windows whose frame is all land round a lake: band 1, 0 of 176; band 2, 0 of 179; **band 3, 1 of 179** (chart 11, Wapauwau); band 4, 7 of 179 (chart 7 Mara, chart 2 Soskin, chart 4 Kakau, chart 9 Ishaara, chart 11 Wapauwau, chart 12 Paulainai, chart 17 Thyargdrekeep); band 5, 8 of 179 (chart 7 Mara, chart 4 Melo, chart 9 Zaakhir, chart 11 Wapauwau, chart 12 Paulainai, chart 13 Faloridell, chart 13 Elemere, chart 16 Fan). Each is inverted outright: the land fill agrees with the cells at 0 of 1,200 sample points today and at 1,200 of 1,200 with the frame ring. No settlement window was all land with no lake.
- **The defect ships today.** Chart 11's Wapauwau at band 3, window `{ u0: 0.484375, v0: 0.1875, u1: 0.609375, v1: 0.3125 }`, is a window today's Explorer draws (on the band-3 lattice; its frame holds on the detailed arm the Explorer requests as well as the bare one). The issue's "not reachable in the Explorer until Issue #954 opens band 4" is stale.
- **The issue's three windows**: chart 7 band 4 is Mara at the issue's own window; chart 7 band 5 is Mara at `{ u0: 0.4296875, v0: 0.64453125, u1: 0.4609375, v1: 0.67578125 }`; chart 2 band 4 is Soskin at `{ u0: 0.5, v0: 0.484375, u1: 0.5625, v1: 0.546875 }`. The counts differ because the sets do: "3 of 300" is the Issue #953 planner's town windows (not recorded), the errata row's "1 of 35" per band is the Issue #952 tier census (5 seeds, 7 windows each), and the census above is a third set. All three find Mara inverted at bands 4 and 5.
- **The same inversion in every fill built the same way.** On a window whose frame is all land, every water iso below sea level is held too, so the topographic deep bands and the nautical shoal are inverted inside its lakes (all 16 coast windows above). The topographic hypsometric stops invert where the frame stands above a stop (stop 0.14 on Mara and Wapauwau at band 4, Paulainai at band 5). Windows whose frame is land and shallow water hold the deep band alone (chart 13 Elemere at band 3, chart 4 Maimaiwapua and chart 14 Khuutbulak at band 4, chart 42 Naukoa at band 5).
- **The witnesses, on the bare arm** (phantom sea is the share of land vertices drawn as sea; phantom land the share of water vertices drawn as land; the floor is the frame ring plus the unsmoothed rings):
  - Wapauwau, band 3: frame all land, 1 lake ring, 409 water vertices of 76,800. Phantom sea 1.0000 today, 0.0073 with the frame ring, floor 0.0073. Phantom land 1.0000 today, 0.0000 with it, floor 0.0000; the frame with the lakes dropped gives phantom land 1.0000. The detailed arm reads the same (0.0073; 1.0000 to 0.0000). Build: world 565 ms, bare region 529 ms (detailed 1,290 ms).
  - Mara, band 4: frame all land, 2 lake rings; frame above stop 0.14 (1 ring), deep 0.3 (1 ring), deep 0.12 (2), shoal (2). Phantom sea 1.0000 today, 0.0075 with the frame ring, floor 0.0075; phantom land 1.0000, 0.0000, 0.0000. Build: world 566 ms, bare region 462 ms. Renders at 1500 px: antique 46 ms, topographic 78 ms, nautical 45 ms.
- **What does not move:**
  - **World sheets.** 301 default worlds (seeds 0 to 300, seed 42 among them) and 420 more (seeds 1 to 30 at land fraction 0.1 and 0.7 in each of the four map types, and at each of the three outlines at looseness 0 and 1): no frame is held at any iso. In every one of the 420 the lowest frame vertex is the world's lowest cell, so no water iso can be held; the coast and every hypsometric stop cannot be by the border guarantee. The committed `chart-42-*` charts and `src/static/og.png` do not move.
  - **The bound atlas's regional plates** (0.38 windows, bare, the capital's and the farthest town's): 200 plates over seeds 1 to 100, no frame held at any iso.
  - **The all-land sheet the patch serves.** The projected frame ring prints exactly the patch's path at every whole width from 300 to 3000 on grids 320 by 240, 160 by 120 and 640 by 480 (0 differ).
  - **The e2e suites.** No e2e check opens chart 11; `region-detail` reads the land path's ring count on seed 2's band 1 to 3 windows round `cx=0.5625&cy=0.4375`, none of which holds its frame on either arm; the other region suites run seed 42, none of whose settlement windows holds its coast frame at bands 1 to 3.
  - **Shipped dresses.** A close-up is drawn antique only (the redraft and the atlas plates), so on a shipped surface only the coast change shows. A gathered sheet is stored as an address and redrawn, never as an SVG, so no stored sheet keeps the old drawing.

## The design

**One rule, one home: `filledIsoRings(field, iso, smooth)` in `src/terrain/contours.ts`.** It returns the rings an even-odd fill of the ground above `iso` needs: `closedIsoRings(field, iso)`, each ring passed through the caller's `smooth`, and, when every vertex on the field's four edges stands above `iso`, the frame rectangle `[[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]]` put first and never smoothed. The fill then covers the frame less the lakes. Every even-odd fill built from contours takes its rings from it, five places in all:

1. `coastRingsGrid` (`src/render/coast.ts`), and through it the land fill, the waterlines, the region land clip (rivers, realm tints, realm borders) and the themed clips (`iso.ts`, `winds.ts`, `field.ts`);
2. `hypsometricLayer` (`src/render/layers/land.ts`);
3. `deepBandPaths` (`src/render/layers/water.ts`);
4. `shoalPaths` (`src/render/layers/water.ts`);
5. `regionRealmRings` (`src/world/realm-carry.ts`), which applies this same rule today through its private `holdsFrame` and now calls the shared one.

The field and the iso are passed once, so a site cannot test the frame of one level and close the rings of another, and the frame cannot reach the smoother, since the helper adds it after.

The particulars:

- **"Above" is strict, `> iso`**, the way `marchingSquares` classes a vertex (`a > iso`), so a frame vertex exactly at the iso is water and its contour closes against the frame as it does today. This is also `holdsFrame`'s test today (it refuses at `<= 0.5`).
- **The frame ring is never smoothed.** Plain Chaikin cuts a quarter of each edge per pass, so a 319 by 239 rectangle would lose a wedge about 80 by 60 cells at each corner on the first pass.
- **The three layers that skip a level with no ring** (`if (rings.length === 0) continue;` and `return [];`) make that check on what `filledIsoRings` returns, so a level the whole window stands above, which has no ring at all, paints the frame.
- **The frame goes first**, as the realm tint puts it today (`test/world/realm-carry.test.ts` pins that order); an even-odd fill does not care about order.
- **The plot-rect patch in `projectedCoastRings` is deleted.** The coast rings are empty only for a uniform field, and a uniform field above sea level now returns the frame ring, so the patch's branch can no longer be reached; its path and the projected frame ring print the same at every width measured.
- **The rule runs everywhere, ungated.** It cannot fire on a world sheet's coast or hypsometric stops (the border guarantee), and fired at no water iso across 721 world sheets, whose lowest frame vertex was the world's lowest cell in every one of the 420 measured for it.

## Alternatives rejected

1. **The rule inside `closedIsoRings`.** Every caller smooths after that call, so the frame ring would go through plain Chaikin in the hypsometric, deep and shoal layers and on a world coast, cutting a wedge about 80 by 60 cells from each corner. And `regionRealmRings` adds its frame after that call, so it would carry two frame rings, which an even-odd fill cancels, untinting the realm across the whole window. `filledIsoRings` takes the smoother as an argument for exactly this reason.
2. **A bare `withFrameRing(rings, field, iso)` wrapped round each `closedIsoRings(...).map(smooth)` by hand.** Five sites would each restate the field and the iso twice, and a site could wrap before smoothing; nothing would catch either.
3. **Extending the patch in `projectedCoastRings`, in pixel space.** It fixes the coast alone, leaves the hypsometric, deep and shoal fills inverted, and keeps one rule in two coordinate spaces.
4. **The coast and the hypsometric tints only, as the issue names.** It leaves the deep bands and the shoal inverted inside the lakes of every one of the 16 coast windows measured. The issue's own reasoning ("build their rings the same way, so they are affected too") reaches them, and Gate 1 item 6 guards the class.
5. **A `world.region` gate.** Golden-safe by construction, but the measurement already shows no world sheet moves, and a gate leaves the rule untrue for any world whose frame ever does hold.
6. **Keeping `holdsFrame` private in `src/world/realm-carry.ts` beside a second copy.** Two implementations of one rule; the realm's whole-frame test pins the shared one byte for byte.
7. **The frame last, so the redraft's coast ink ceremony (`dashCoastForInk` in `src/site/explorer/draw-ceremony.ts`) reaches the lake's shore before the frame.** It would change the realm tint's order, which a test pins, and the ceremony already runs the frame segments of every coast cut by the window in the same single dash; the plate reader reads the ceremony on Wapauwau instead (Evidence).
8. **Pinning the hypsometric, deep and shoal smoothing to the frame, as the coast's is.** A separate defect (their frame-closed rings round inward at the corners today), not this issue's: it becomes an errata row (Rosters and doctrine, item 5).

## Files

Every file stays under 400 lines and every function under 50.

1. **`src/terrain/contours.ts`** (352 lines, about 375 after). After `closedIsoRings` and before the `export { chaikinSmooth, ... } from "./polyline.ts";` line, add:
   - `function holdsFrame(field: Field, iso: number): boolean`, not exported: with `const { w, h, data } = field;`, return `false` at the first `x` in `0..w-1` where `data[x] as number` or `data[x + (h - 1) * w] as number` is `<= iso`, then at the first `y` in `0..h-1` where `data[y * w] as number` or `data[w - 1 + y * w] as number` is `<= iso`; else `true`. It is `holdsFrame` in `src/world/realm-carry.ts` today with `iso` for `0.5` and the field's own `w` and `h`.
   - `export function filledIsoRings(field: Field, iso: number, smooth: (points: ReadonlyArray<Point>) => Point[]): Array<ReadonlyArray<Point>>`:
     ```ts
     const rings: Array<ReadonlyArray<Point>> = closedIsoRings(field, iso).map((c) => smooth(c.points));
     if (!holdsFrame(field, iso)) return rings;
     const frame: Point[] = [
       [0, 0],
       [field.w - 1, 0],
       [field.w - 1, field.h - 1],
       [0, field.h - 1],
     ];
     return [frame, ...rings];
     ```
   - **The first commit's stub** (the right shape, the wrong answer): `holdsFrame` as above, and `filledIsoRings` as above except that its frame's last two points are `[field.w - 1, 0]` and `[0, 0]`, a ring with no area. It is wired nowhere in that commit.
2. **`src/render/coast.ts`**: the import from `../terrain/contours.ts` becomes `chaikinSmooth, chaikinSmoothPinned, filledIsoRings` (`closedIsoRings` leaves it), and `coastRingsGrid` becomes:
   ```ts
   export function coastRingsGrid(world: World, coastIters: number): Array<ReadonlyArray<Point>> {
     const { elev, seaLevel } = world;
     if (world.region === undefined) {
       return filledIsoRings(elev, seaLevel, (p) => chaikinSmooth(p, true, coastIters));
     }
     const onFrame = frameVertexPredicate(elev.w, elev.h);
     return filledIsoRings(elev, seaLevel, (p) => chaikinSmoothPinned(p, coastIters, onFrame));
   }
   ```
   `frameVertexPredicate` is unchanged.
3. **`src/render/map-renderer.ts`**: `projectedCoastRings` keeps its signature and becomes the projection alone; the `if (coastRings.length === 0) { ... }` block and its plot-rect literal are deleted:
   ```ts
   function projectedCoastRings(world: World, proj: Projection): ReadonlyArray<PxRing> {
     const coastIters = coastSmoothingIterations(proj.widthPx);
     return coastRingsGrid(world, coastIters).map((ring) => ring.map(([x, y]) => [proj.px(x), proj.py(y)] as const));
   }
   ```
4. **`src/render/layers/land.ts`**: the import from `../../terrain/contours.ts` becomes `chaikinSmooth, filledIsoRings, marchingSquares`; in `hypsometricLayer` the `rings` line becomes `const rings = filledIsoRings(world.elev, iso, (p) => chaikinSmooth(p, true, 2));`, followed by the existing `if (rings.length === 0) continue;`. Nothing else in the file changes.
5. **`src/render/layers/water.ts`**: the import from `../../terrain/contours.ts` becomes `chaikinSmooth, filledIsoRings`; in `deepBandPaths`, `const rings = filledIsoRings(world.elev, iso, (p) => chaikinSmooth(p, true, 1));` followed by its `if (rings.length === 0) continue;`; in `shoalPaths`, `const rings = filledIsoRings(world.elev, iso, (p) => chaikinSmooth(p, true, 2));` followed by its `if (rings.length === 0) return [];`.
6. **`src/world/realm-carry.ts`**: `holdsFrame` is deleted. In `regionRealmRings` the loop body becomes `const indicator = ...` (unchanged), `const soft = boxBlur(indicator, 3);` (unchanged), `const rings = filledIsoRings(soft, 0.5, (p) => chaikinSmoothPinned(p, 2, onFrame));` and `if (rings.length > 0) out.push({ realm, rings });`: the `as RealmRing` cast and the `if (holdsFrame(...)) { rings.unshift(...) }` block go. The `../core/grid.ts` import drops `type Field` (no longer used) and keeps `createField`; the `../terrain/contours.ts` import becomes `chaikinSmooth, chaikinSmoothPinned, filledIsoRings`.
7. **`test/terrain/contours.test.ts`**: `closedIsoRings` and `filledIsoRings` join the import from `../../src/terrain/contours.ts`; tests C1 to C3 below, appended at the end of the file.
8. **`test/render/region-coast.test.ts`** (125 lines, about 260 after): new imports, then the helpers and tests R1 to R6 below, appended after the last existing test; the existing tests and helpers are untouched.
9. **`handbook/specs/region-and-voyage.md`**: one bullet added (wording below).
10. **`handbook/specs/engine-invariants.md`**: one sentence replaced (wording below).
11. **`handbook/errata/engine.md`**: the row beginning `- PR #1024 (2026-10-22, high): the band-4 and band-5 close-ups of Mara` deleted (the defect it records is fixed here), and one new row added for the sibling (Rosters and doctrine, item 5).
12. **`handbook/plans/972/972-plan.md`**: this plan, copied unchanged.

No other source file is touched. After commit 2, `closedIsoRings` has one caller in `src/`, `filledIsoRings`; it stays exported, since the tests and the `region-detail` e2e suite read it.

## Tests, in the order they are written

Each red is read with `node --test <file>` at the first commit. "Prover" marks the guards `vellum-guard-prover` gets at step 11; a guard changed after that round is the implementer's to prove (workflow step 15).

### In `test/terrain/contours.test.ts`

The field shared by C1 and C2: `const lake = (x: number, y: number): number => (x >= 4 && x <= 7 && y >= 3 && y <= 6 ? 0 : 1);` on `createField(12, 10, ...)`, iso `0.5`. `const same = (p: ReadonlyArray<Pt>): Pt[] => [...p];` is the smoother that changes nothing (`Pt` is this file's own point type).

- **C1** `"a field above the iso on every frame vertex takes the frame first, unsmoothed, and its lake's ring smoothed (Issue #972)"`. `const f = createField(12, 10, lake); const closed = closedIsoRings(f, 0.5);` Precondition: `assert.equal(closed.length, 1, "the lake has one ring")`. Then `assert.deepEqual(filledIsoRings(f, 0.5, (p) => chaikinSmooth(p, true, 1)), [[[0, 0], [11, 0], [11, 9], [0, 9]], chaikinSmooth(closed[0]!.points, true, 1)]);`. Red on the stub: the deepEqual (the stub frame's last two points). Prover; mutations: `filledIsoRings` returns `rings` whether or not the frame holds; the frame's third point `[field.w - 1, 0]`; the frame put after the rings; the rings dropped (`[frame]`); the frame passed through `smooth` with the rest.
- **C2** `"a frame vertex at the iso, on any of the four sides, adds no frame ring (Issue #972)"`. A loop `for (const [side, sx, sy] of [["top", 6, 0], ["bottom", 6, 9], ["left", 0, 5], ["right", 11, 5]] as const)`, whose body is: `const f = createField(12, 10, (x, y) => (x === sx && y === sy ? 0.5 : lake(x, y)));` `const closed = closedIsoRings(f, 0.5);` the precondition `assert.equal(closed.length, 2, side + ": the lake and the land closed round the notch");` (measured: rings of 17 and 7 points on each side, the 7 being the notch's 3 and the frame's 4 corners), then `assert.deepEqual(filledIsoRings(f, 0.5, same), closed.map((c) => [...c.points]), side);`. It is the negative half: green from the first commit's stub on (on main the import does not resolve). Prover; mutations: `holdsFrame` refuses only at `< iso` (all four sides red); its column loop deleted (left and right red); its row loop deleted (top and bottom red).
- **C3** `"a field above the iso everywhere is the frame alone, and a field below it everywhere is no ring (Issue #972)"`. `const high = createField(6, 5, () => 1);` precondition `assert.deepEqual(closedIsoRings(high, 0.5), [])`, then `assert.deepEqual(filledIsoRings(high, 0.5, same), [[[0, 0], [5, 0], [5, 4], [0, 4]]]);` and `assert.deepEqual(filledIsoRings(createField(6, 5, () => 0), 0.5, same), []);`. Red on the stub: the `high` deepEqual. This is the case the deleted patch served. Prover; mutations: `holdsFrame` returns `true` (the low assertion reds); returns `false` (the high one reds).

### In `test/render/region-coast.test.ts`

New imports: `createField` and `minMax` from `../../src/core/grid.ts`; `createRng` from `../../src/core/rng.ts`; `createLabelArena, type RenderCtx` from `../../src/render/context.ts`; `hypsometricLayer` from `../../src/render/layers/land.ts`; `STYLES, type StyleName` from `../../src/render/style.ts`; `pathFrom, renderSvg` from `../../src/render/svg.ts`; `createProjection, marginFor` from `../../src/render/transform.ts`; `type UvWindow` from `../../src/terrain/heightfield.ts`. `closedIsoRings`, `chaikinSmooth` and `type Point` are already imported from `../../src/terrain/contours.ts`, and `World`, `renderMap`, `generateRegionWorld`, `defaultRecipe` and `generateWorld` already from theirs.

New module-level helpers, appended after the file's last existing test and followed by R1 to R6, exactly as written (no comments):

```ts
const WAPAUWAU_BAND3: UvWindow = { u0: 0.484375, v0: 0.1875, u1: 0.609375, v1: 0.3125 };
const MARA_BAND4: UvWindow = { u0: 0.4140625, v0: 0.6328125, u1: 0.4765625, v1: 0.6953125 };
const PLOT = createProjection(320, 240, 1500, marginFor(1500));
const FRAME_CORNERS: Point[] = [
  [0, 0],
  [319, 0],
  [319, 239],
  [0, 239],
];
const FRAME_D = pathFrom(
  FRAME_CORNERS.map(([x, y]) => [PLOT.px(x), PLOT.py(y)] as const),
  true,
);

function regionAt(seed: number, window: UvWindow): World {
  const world = generateWorld(defaultRecipe(seed));
  return generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "Test Region" });
}

let wapauwau: World | undefined;
const wapauwauBand3 = (): World => (wapauwau ??= regionAt(11, WAPAUWAU_BAND3));
let mara: World | undefined;
const maraBand4 = (): World => (mara ??= regionAt(7, MARA_BAND4));

const maraSvgs = new Map<StyleName, string>();
function maraSvg(style: StyleName): string {
  const cached = maraSvgs.get(style);
  if (cached !== undefined) return cached;
  const svg = renderMap(maraBand4(), { style, widthPx: 1500 });
  maraSvgs.set(style, svg);
  return svg;
}

function frameOf(world: World): Point[] {
  const { w, h } = world.elev;
  return [
    [0, 0],
    [w - 1, 0],
    [w - 1, h - 1],
    [0, h - 1],
  ];
}

function frameAbove(world: World, iso: number): boolean {
  const { elev } = world;
  for (let x = 0; x < elev.w; x++) if (elev.at(x, 0) <= iso || elev.at(x, elev.h - 1) <= iso) return false;
  for (let y = 0; y < elev.h; y++) if (elev.at(0, y) <= iso || elev.at(elev.w - 1, y) <= iso) return false;
  return true;
}

function phantomLandFraction(world: World, rings: ReadonlyArray<ReadonlyArray<Point>>): number {
  const { elev, seaLevel } = world;
  let water = 0;
  let phantom = 0;
  const EPS = 1e-4;
  for (let y = 0; y < elev.h; y++) {
    for (let x = 0; x < elev.w; x++) {
      if (elev.at(x, y) > seaLevel) continue;
      water++;
      if (drawnAsLand(rings, x + EPS, y + EPS)) phantom++;
    }
  }
  return water === 0 ? 0 : phantom / water;
}

function firstPathIn(svg: string, anchor: string): string {
  const at = svg.indexOf(anchor);
  assert.notEqual(at, -1, `the sheet holds ${anchor}`);
  const d = /<path d="([^"]*)"/.exec(svg.slice(at, svg.indexOf("</", at)))?.[1];
  assert.ok(d !== undefined, `a path opens ${anchor}`);
  return d;
}
```

`FRAME_D` is `M68 68L1432 68L1432 1089.93L68 1089.93Z` (measured). `firstPathIn` reads only inside the anchored element, up to its first closing tag, so a layer with no path of its own cannot hand back a later layer's (elements with no children self-close in `renderSvg`, so it reads past the ocean layer's rect). The witnesses are on the bare arm, as `capitalRegion` in this file builds. `npm run format` may re-wrap any of this; the code is what is fixed, not its layout.

- **R1** `"chart 11's Wapauwau at band 3, its frame all land round a lake, draws its land as land and its lake as water (Issue #972)"`. `const region = wapauwauBand3();` Preconditions: `assert.ok(frameAbove(region, region.seaLevel), "Wapauwau's band-3 window must hold land on every frame vertex, or this test cannot fail; re-sweep for a window that does")` and `assert.ok(closedIsoRings(region.elev, region.seaLevel).length > 0, "Wapauwau's band-3 window must hold a lake")`. Then `const rings = coastRingsGrid(region, COAST_ITERS); const floor = [frameOf(region), ...plainRings(region, 0)];` and `assert.ok(phantomSeaFraction(region, rings) <= phantomSeaFraction(region, floor) + 0.005, ...)` then `assert.ok(phantomLandFraction(region, rings) <= phantomLandFraction(region, floor) + 0.005, ...)`, each message printing both figures as the existing tests do. The bound is this file's existing contract for the pinned coast (#223), `floor + 0.005`, with the frame in the floor; the floor never calls `filledIsoRings`. Red on main and the stub: the phantom sea, 1.0000 against 0.0123. Prover; mutations: `coastRingsGrid`'s region branch returns `closedIsoRings(elev, seaLevel).map((c) => chaikinSmoothPinned(c.points, coastIters, onFrame))` (today's rings); `filledIsoRings` returns `[frame]` when held (phantom land 1.0000).
- **R2** `"the drawn close-up opens its land fill and its land clip with the frame (Issue #972)"`. `const svg = renderMap(wapauwauBand3(), { style: "antique", widthPx: 1500 });` `assert.ok(firstPathIn(svg, '<g id="layer-land">').startsWith(FRAME_D), ...)` and `assert.ok(firstPathIn(svg, '<clipPath id="region-land-clip">').startsWith(FRAME_D), ...)`. Red on main: the land path opens on the lake's ring. Prover; mutation: as R1's first.
- **R3** `"chart 7's Mara at band 4 opens its first hypsometric tint with the frame (Issue #972)"`. Preconditions: `const region = maraBand4();` `const t = STYLES.topographic.hypsometric?.[1]?.t;` `assert.ok(t === 0.14, "the first tinted stop is 0.14");` `const { max } = minMax(region.elev);` `assert.ok(frameAbove(region, region.seaLevel + t * Math.max(1e-9, max - region.seaLevel)), "Mara's band-4 frame must stand above the first tinted stop, or this test cannot fail");`. Then `assert.ok(firstPathIn(maraSvg("topographic"), '<g id="layer-hypsometric">').startsWith(FRAME_D), ...)`. Red on main: the stop's path opens on its one ring. Prover; mutations: `hypsometricLayer`'s `rings` line back to `closedIsoRings(world.elev, iso).map((c) => chaikinSmooth(c.points, true, 2))`; `filledIsoRings` passing the frame through `smooth` with the rest (which rounds its corners).
- **R4** `"chart 7's Mara at band 4 opens its first deep band with the frame (Issue #972)"`. Precondition: `assert.ok(frameAbove(maraBand4(), maraBand4().seaLevel), "Mara's band-4 frame must be all land, and so above every water level")`. Then `assert.ok(firstPathIn(maraSvg("topographic"), '<g id="layer-ocean">').startsWith(FRAME_D), ...)`. Red on main. Prover; mutation: `deepBandPaths`'s `rings` line back to `closedIsoRings(world.elev, iso).map((c) => chaikinSmooth(c.points, true, 1))`.
- **R5** `"chart 7's Mara at band 4 opens its shoal with the frame on the nautical dress (Issue #972)"`. The same precondition; `assert.ok(firstPathIn(maraSvg("nautical"), '<g id="layer-ocean">').startsWith(FRAME_D), ...)`. Red on main. Prover; mutation: `shoalPaths`'s `rings` line back to `closedIsoRings(world.elev, iso).map((c) => chaikinSmooth(c.points, true, 2))`.
- **R6** `"a tint the whole close-up stands above is painted to the frame (Issue #972)"`. Over a field with no ring at all, so where the empty check reads is what it tests:
  ```ts
  const region = maraBand4();
  const world: World = { ...region, elev: createField(320, 240, () => region.seaLevel + 1) };
  const ctx: RenderCtx = {
    world,
    style: STYLES.topographic,
    proj: PLOT,
    coastRings: [],
    elevSpan: 2,
    rng: createRng(7).fork("render"),
    realmTint: [],
    labels: createLabelArena(),
  };
  const layer = hypsometricLayer(ctx);
  assert.ok(layer, "the topographic dress has a hypsometric layer");
  const svg = renderSvg(layer);
  ```
  With `elevSpan` 2 the stops 0.14, 0.28 and 0.42 sit at sea level plus 0.28, 0.56 and 0.84, under the field's plus 1, and 0.56 and above sit over it. Then `assert.equal(svg.split("<path").length - 1, 3, "three stops under the field, each painted")` and `assert.equal(svg.split('<path d="' + FRAME_D + '"').length - 1, 3, "each painted as the frame alone")`. Red on main: 0 paths (no stop has a ring). Prover; mutation: in `hypsometricLayer`, `if (closedIsoRings(world.elev, iso).length === 0) continue;` inserted before the `rings` line.

The same mutation in `deepBandPaths` and `shoalPaths` is not tested and is not owed: a level the whole window stands above with no ring there is a uniform field above a water iso, which is all land, and the land fill covers the ocean layer whole, so the mutant changes bytes under an opaque fill and nothing a reader sees. Name it in the PR body as not proven, for that reason.

### The existing guard the change re-points

`"a realm holding the whole frame is tinted to the frame, its enclaves cut out (Issue #953)"` in `test/world/realm-carry.test.ts` holds `regionRealmRings` once it calls `filledIsoRings`. It stays green unchanged. Prover; mutation: `regionRealmRings`'s `rings` line back to `closedIsoRings(soft, 0.5).map((c) => chaikinSmoothPinned(c.points, 2, onFrame))`.

### Which tests the prover owes

All of C1, C2, C3, R1 to R6 and the realm test above, with the mutations named at each, at the branch head once commit 2 is made (commits 3 and 4 touch no code). Every mutation is by line, against the commit, never by text.

## Order of commits

Each subject starts `#972`; each message ends with the three trailer lines `CLAUDE.md`'s Process section gives, the session link being `https://claude.ai/code/session_01LRTjZiwKu5qBHM1mZsUFVk`.

1. `#972 The frame-ring plan, and a fill held on every frame vertex opens with the frame (red)`: `handbook/plans/972/972-plan.md`; `src/terrain/contours.ts` with `holdsFrame` and the stub `filledIsoRings`, wired nowhere; C1 to C3 and R1 to R6. Red, on their assertions: C1, C3, R1 to R6. Green: C2 and every existing test. Push.
2. `#972 A fill whose ground holds the whole frame takes the frame as its first ring`: the true frame in `filledIsoRings`; `coastRingsGrid`, `hypsometricLayer`, `deepBandPaths`, `shoalPaths` and `regionRealmRings` on it; `holdsFrame` gone from `src/world/realm-carry.ts`; the patch gone from `projectedCoastRings`. All green.
3. `#972 The doctrine and the ledger follow the frame ring`: the two spec edits and the PR #1024 errata row deleted.
4. After the pull request opens, so its number is known: `#972 The ledger takes the other fills' smoothing at the frame`: the sibling row (Rosters and doctrine, item 5). Pushed before the cold skeptic is dispatched.

## Rosters and doctrine

No new file is created outside `handbook/plans/972/`, so nothing joins a roster: both test files exist, no test reads a source file, and no suite, page or sheet is added.

1. **`handbook/specs/region-and-voyage.md`**, a new bullet directly after "A region's coast closes against the window rect, and only the TRUE shore may round.":
   > - **Where the ground stands above a fill's iso on every vertex of the frame, the frame rect is that fill's first ring.** No contour reaches the frame to close against, so the rings are the water inside alone, and an even-odd fill would paint the water and leave the land bare. Every even-odd fill built from contours takes its rings from `filledIsoRings` in `src/terrain/contours.ts`, which closes them with `closedIsoRings`, smooths them with the caller's smoother, and puts the frame first, never smoothed, where the ground holds it: the coast (`coastRingsGrid` in `src/render/coast.ts`), the hypsometric tints, the deep and shoal water, and the realm tints.
2. **`handbook/specs/engine-invariants.md`**, in "The candidate path if the deferral is ever revisited", the sentence "It is `closedIsoRings` in `src/terrain/contours.ts`, reached from `src/render/coast.ts` and the land and water layers." becomes:
   > It is `closedIsoRings` in `src/terrain/contours.ts`, wrapped for every even-odd fill by `filledIsoRings` beside it, which adds the frame where the ground holds the whole of it, and reached from `src/render/coast.ts`, the land and water layers and `src/world/realm-carry.ts`.
3. **`handbook/errata/engine.md`**: the PR #1024 row on Mara deleted (errata README, "Fixed").
4. **`handbook/specs/rulebook.md`, `CLAUDE.md`, the gates and the agents**: nothing; no regen, no golden, no roster.
5. **The sibling, an errata row** in `handbook/errata/engine.md` under `## Open`, after the last row, once the pull request's number `<P>` is known (commit 4). Before writing it, grep `handbook/errata/` for `pinned`, `chaikin` and `hypsometric`, and search the open issues (`gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open hypsometric'`); the planner found none on 2026-10-23. The row, one line:
   > - PR #<P> (<date>, high): on a close-up the hypsometric tints, the deep bands and the shoal smooth their rings unpinned (`hypsometricLayer` in `src/render/layers/land.ts`, `deepBandPaths` and `shoalPaths` in `src/render/layers/water.ts`), so where a ring closes against the frame its corners round inward and ground above the level is drawn outside its fill, up to 18.7 points more of it than pinned smoothing leaves and over 1 point on 77 levels, across the capital windows of seeds 42, 7, 2, 15 and 23 at bands 1 to 3; only the topographic and nautical dresses draw them, and no shipped close-up wears either. Searched: `handbook/errata/` for pinned, chaikin and hypsometric, and the open issues for hypsometric: none; found by the Issue #972 planner.

## Evidence

- **The reds** at commit 1: `node --test test/terrain/contours.test.ts test/render/region-coast.test.ts`, red on C1, C3 and R1 to R6 at their assertions; paste each red line into the PR body's guard table.
- **The greens** at commit 2: the same command plus `test/world/realm-carry.test.ts` (28 tests across the three files were green on main at `ac767833`, before this plan's).
- **The suite**: `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes), `npm test` and then `npm run astro:generate`.
- **No regen owed**: `node --test test/site/hero-charts.test.ts test/world/golden-seed42.test.ts` green, and `git diff --stat origin/main -- src/static` prints nothing. Name both in the PR body (Gate 6 item 7).
- **The atlas**: `node --test test/atlas/` green.
- **e2e**: no suite is owed locally. The change draws differently only a window whose frame holds, and no e2e check opens one (The defect, measured). CI's lanes run every suite; name in the body that none ran locally and why.
- **The sheets, before and after.** Create `out/972/render.ts` (gitignored, never committed):
  ```ts
  import { writeFileSync } from "node:fs";
  import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
  import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
  import { renderMap } from "../../src/render/map-renderer.ts";

  const arm = process.argv[2];
  if (arm !== "before" && arm !== "after") throw new Error("usage: node out/972/render.ts before|after");
  const sheets = [
    ["wapauwau-b3", 11, { u0: 0.484375, v0: 0.1875, u1: 0.609375, v1: 0.3125 }],
    ["mara-b4", 7, { u0: 0.4140625, v0: 0.6328125, u1: 0.4765625, v1: 0.6953125 }],
    ["mara-b5", 7, { u0: 0.4296875, v0: 0.64453125, u1: 0.4609375, v1: 0.67578125 }],
    ["soskin-b4", 2, { u0: 0.5, v0: 0.484375, u1: 0.5625, v1: 0.546875 }],
  ] as const;
  for (const [name, seed, window] of sheets) {
    const world = generateWorld(defaultRecipe(seed));
    const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: regionTitle(world, window), detail: true });
    writeFileSync(new URL(`./${name}-${arm}.svg`, import.meta.url), renderMap(region, { style: "antique", widthPx: 1500 }));
    const land: string[] = [];
    for (let gy = 4; gy < region.elev.h; gy += 8) {
      for (let gx = 4; gx < region.elev.w; gx += 8) land.push(`${gx},${gy},${region.elev.at(gx, gy) > region.seaLevel ? 1 : 0}`);
    }
    writeFileSync(new URL(`./${name}-cells.csv`, import.meta.url), "gx,gy,land\n" + land.join("\n") + "\n");
    console.log(`${name}: ${land.filter((r) => r.endsWith(",1")).length} of ${land.length} sample cells are land`);
  }
  ```
  Run `node out/972/render.ts before` once commit 1 is made (no `src/` behaviour has changed there, so it draws main's sheets), and `node out/972/render.ts after` once commit 2 is made; keep both printouts for `out/972/notes.md`. The sample lattice is the census's (every 8 cells from 4, 1,200 points); grid cell `(gx, gy)` sits at pixel `(68 + gx * 1364 / 319, 68 + gy * 1364 / 319)` on the 1500 px sheet.
- **`vellum-plate-reader` is owed, one round at step 11**, after commit 2, in the implementer's tree. The ask, three parts:
  1. **The fill, measured.** For each of the eight SVGs `out/972/{wapauwau-b3,mara-b4,mara-b5,soskin-b4}-{before,after}.svg`, render it at its own 1500 px width with every layer but `#layer-ocean` and `#layer-land` hidden (so neither ink nor the parchment texture covers a sample), read the pixel at each row of the sheet's `-cells.csv`, call it land when it is nearer `#f2e8cf` (the antique land fill) than `#d9e2d2` (the antique sea fill), and report how many of the 1,200 agree with the `land` column. The bound is the discriminator's midpoint, 600: an inverted fill agrees at about the share of water samples (0 of 1,200 in the census on these windows) and a right one at about all of them less the few samples on a coast stroke, so a before sheet reads below 600 and an after sheet above it.
  2. **The sheet, read.** Each after sheet at full scale and in a 1:1 crop round its lake: the lake reads as water, the ground round it as land, the rivers and the realm tint stand on the land, and nothing traces the frame beyond the coast stroke's inner half, which an all-land sheet shows today.
  3. **The ceremony, read, not gated.** In the Explorer at `#seed=11&style=antique&cx=0.5426&cy=0.2794&k=8` (the camera centred on Wapauwau's band-3 window; the redrafted inset's stamped window reads `u0` 0.484375, `v0` 0.1875 when the link lands on it), when in the redraft's ink ceremony the lake's coast appears. The frame is now the land path's first subpath and `dashCoastForInk` dashes the path at its whole length; whether the dash runs on across subpaths is unread, and a coast cut by the window already runs its frame segments in the same dash today. Report the reading in the PR body.
- **The delivery**: `out/972/notes.md`, opening `# Issue #972: a close-up's land drawn as land`, saying to look at `wapauwau-b3-before` beside `wapauwau-b3-after` first (the one a reader reaches today), then the Mara and Soskin pairs, with the plate reader's figures; then `npm run delivery -- out/972`. Report the folder, `out/972/index.html` and each file by absolute path, for the dispatcher to copy across.

## Calls made

The implementer copies these into its step 12 comment.

1. **The whole class of fills**, adding the deep bands and the shoal to the issue's coast and hypsometric tints. Rule: Gate 1 item 6 (guard the class), and the issue's own "build their rings the same way, so they are affected too"; measured inverted on all 16 coast windows.
2. **One shared home, `filledIsoRings(field, iso, smooth)` in `src/terrain/contours.ts`**, which takes the smoother so the frame stays out of it, and replaces `holdsFrame` in `src/world/realm-carry.ts`. Rule: one implementation of one rule (`handbook/specs/conventions.md`, "Exactly one home is normative"); the realm's whole-frame test pins it byte for byte.
3. **Ungated, world sheets included; no regen.** Rule: the rulebook's cost axis, and a gate earns nothing for a case that does not occur; measured: 721 world sheets, none held, the lowest frame vertex the world's lowest cell in every one of 420; the coast and the hypsometric stops cannot hold by the border guarantee.
4. **The plot-rect patch deleted.** Rule: Gate 5 item 1 (no dead code); unreachable once the rule holds, and byte-identical at every width measured.
5. **"Above" is strict, `> iso`.** Rule: `marchingSquares`'s own classing, and `holdsFrame`'s today.
6. **The frame never smoothed, put first, and counted by each empty check.** Rule: `handbook/specs/region-and-voyage.md`, "only the TRUE shore may round" (plain Chaikin would cut an 80 by 60 cell wedge from each corner); first because the realm tint's pinned order already is.
7. **The witnesses are on the bare arm.** Rule: the defect is in the ring construction, not the terrain; both arms measured equally inverted on Wapauwau and Mara, and the bare one costs about 0.5 s against 1.3 to 1.7 s and does not move when Issue #954 deepens the chain.
8. **The coast witness is chart 11's Wapauwau at band 3**, a window today's Explorer draws, and not the issue's band-4 Mara. Rule: pin the defect where it ships. Mara at band 4 carries the topographic and nautical pins, since no band-3 window in the census stood above a hypsometric stop.
9. **`vellum-plate-reader` owed once, at step 11, and no step-6 spike.** Rule: `CLAUDE.md`'s presentation rule, since the rivers and the realm tint come back onto the land and no unit test sees a painted sheet; there is no appearance to choose, since a frame-held sheet draws as any land touching the frame draws today. Its fill bound is the discriminator's midpoint (600 of 1,200), measured on the fill layers alone so that ink and texture do not move it.
10. **The Mara report on Issue #954 is this defect, taken here.** Rule: workflow step 15, a near duplicate folds into the older issue: Issue #972 was filed 2026-10-22T16:55Z, before Issue #954's comment of 2026-10-23T09:23Z handed Mara to that issue. Both of its windows are measured and covered. The square coast at bands 5 and 6 named on Issue #954 is a different defect and stays there.
11. **The PR #1024 errata row is deleted here** (errata README, "Fixed"), **and the unpinned smoothing of the other fills becomes a new row, not a fold.** Rule: Gate 5 item 7; it reaches no shipped surface.
12. **No code comment.** Rule: the comment doctrine; the tests name their witnesses in their messages.

## Open decisions

none

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat ac7678332cb2b7ba3e6af26eedd7883b6b77e90f origin/main -- src/terrain/contours.ts src/render/coast.ts src/render/map-renderer.ts src/render/layers/land.ts src/render/layers/water.ts src/world/realm-carry.ts test/terrain/contours.test.ts test/render/region-coast.test.ts test/world/realm-carry.test.ts` prints anything.
- Before the first commit, `git grep -n "closedIsoRings(" -- src/` lists anything beyond its definition in `src/terrain/contours.ts` and the five calls this plan names (one each in `src/render/coast.ts`, `src/render/layers/land.ts` and `src/world/realm-carry.ts`, two in `src/render/layers/water.ts`).
- A precondition fails: C1's one lake ring, C2's two rings on any side, C3's empty ring set, R1's frame or lake on Wapauwau, R3's stop 0.14 or its frame, R4's frame on Mara. The world moved under a witness; never choose a new witness yourself.
- At commit 1 any test other than C1, C3 and R1 to R6 is red, or any of those is red on something other than its assertion (an anchor, a missing export, a thrown error).
- R1's phantom sea at commit 1 is not 1.0000, or after commit 2 either phantom figure exceeds its floor by more than 0.005.
- After commit 2 any existing test is red, above all the realm whole-frame test, `test/site/hero-charts.test.ts` (a world sheet moved, which the measurement says cannot happen), `test/world/golden-seed42.test.ts`, `test/render/region-coast.test.ts`'s five existing tests, or `test/site/region-detail-wiring.test.ts`.
- `npm run check` refuses a type this plan gives (the planner type-checked `filledIsoRings` and its five call shapes against the tree's own types).
- `git diff --stat origin/main -- src/static` prints anything.
- The plate reader's fill count puts a before sheet at 600 or more of 1,200, or an after sheet under 600, or its read of an after sheet finds the lake drawn as land, the land as sea, or the frame traced by anything new.
