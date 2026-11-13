# Issue #976: a region hamlet's harbour and river flags are read where it is drawn

A region hamlet carries the `harbor` and `onRiver` flags `NamedSettlement` gives every place, and today they are worked out on the WORLD grid, where a world cell beside the sea or a river makes the flag true, while the hamlet is drawn on the close-up, whose shore and rivers lie up to two world cells away. The issue's comment (6354354203) adds `onRiver` to the `harbor` flag the body holds open: whatever this issue does to one, it does to both.

- **Planned at**: `origin/main` `2f66e4ee` (2f66e4eef52dc8a5c4c475979080c03f9f11023c); Issue #976 read with 2 comments (6354354203, 2026-10-23; and the rulings, 6867607423, 2026-11-13). Re-recorded after the rulings: `origin/main` has not moved since the draft.
- **Rulings**: https://github.com/ahl-gram/Vellum/issues/976#issuecomment-6867607423 (Alex, 2026-11-13): Q1 (b), "Recompute the notes (Recommended)": every hamlet stays where it is drawn and its `harbor` and `onRiver` flags are read from the close-up itself; nothing drawn changes; the region spec's sentence "A region hamlet is not seated: its `harbor` flag (Issue #976) and its `onRiver` flag stay at world resolution." is rewritten as Rosters and doctrine says. The plan was written to (b), so the ruling changes no section of the design, files or tests. The eight calls below stand.
- **Open decisions**: none.
- **Archive path**: `handbook/plans/900/976/976-plan.md`.

## What recon and the census found

1. **Nothing reads a region hamlet's flags today.** Recon traced every reader of `harbor` and `onRiver` (`git grep -n -P '\bharbor\b|onRiver' -- src`), and none reaches a hamlet: `createLoreWriter` (`src/society/lore.ts`) is called by the bound atlas's gazetteer (`gazetteerHtml` in `src/atlas/compose.ts`, over the world's settlements), the daily hunt (`src/world/daily-hunt.ts`), the prospect job (`prospectResultFor` in `src/site/explorer/prospect-job.ts`, which the worker hands the world from `worldFor`, never a close-up) and the Seed of the Day (`src/site/seed-of-the-day/app.ts`); `buildProspectInput` (`src/prospect/input.ts`) reads the world's settlements; `conjureBestiary` (`src/society/bestiary.ts`) runs inside `generateWorld` alone; the place card is composed from the manifest (`composePlaceCard` in `src/render/place-card.ts`, `PlaceMark` in `src/render/place-manifest.ts`), which carries neither flag, and a hamlet's card hides its action row because its `worldIdx` is null (`paintActs` in `src/site/shared/living-chart/place-overlay-card.ts`); and nothing under `src/render` names either flag. So the mismatch is latent: it reaches no page, card or sheet, and would reach the first surface that reads a hamlet's flag.
2. **The mismatch, measured** (the census below, 525 close-ups, 2,176 hamlet appearances, `976-probe/summary-today.out`): of the hamlets the world puts beside water, 16 of 175 stand beside the close-up's water at band 3, 5 of 55 at band 4 and 1 of 19 at band 5; of those it puts on a river, 11 of 125, 2 of 40 and 0 of 10 stand on or beside a river the close-up draws. A world-harbour hamlet off the water stands a median 0.90, 0.91 and 0.98 world cells from it at bands 3 to 5, the farthest 2.61; a world-river hamlet off its river a median 0.80, 0.81 and 0.51, the farthest 2.30. On every harbour town's window of charts 42, 7, 2, 15 and 23 that is not among each chart's first twelve town windows (the issue's own kind of sample), 80 of 84 world-harbour hamlets stand off the water at band 3 and 6 of 7 at band 5. The issue's own figures (26 of 28 at 0.125, 4 of 4 at 1/32) name no windows and stay UNVERIFIABLE; these agree with them in kind.
3. **Read on the close-up, the flags only ever turn off.** Re-reading both flags at each hamlet's drawn cell turns 159, 50 and 18 harbour flags from true to false at bands 3 to 5 and 114, 38 and 10 river flags, and turns none from false to true: no hamlet the world keeps from the water stands beside the close-up's.
4. **Re-reading them moves nothing drawn** (`976-bytes.ts`, `976-probe/bytes.out`): on one harbour-town close-up a band of charts 42, 7, 2, 15 and 23 (15 close-ups, 20 hamlets whose flags change), the sheet in all four styles with its key and its beast and the place manifest are byte for byte the same with the flags re-read as without: 0 of 75 differ.
5. **Laid rivers and every drawn river agree on every census hamlet**: a hamlet on or beside a river laid from the world is on or beside a drawn river and the other way round, 0 of 2,176 differ. No world on the census tells the two masks apart (Calls made, 2).
6. **Seating (option (a)) moves most flagged hamlets, and far at depth**: 272 of 300 flagged hamlet appearances move at band 3, median 0.73 world cells, the farthest 2.12; 88 of 95 at band 4, median 0.79, the farthest 2.02; 28 of 29 at band 5, median 0.89, the farthest 2.04 (a world cell is about 34 px of a 1500 px sheet at band 3 and about 137 px at band 5). Every seat finds its water or river but one harbour at band 3. Seated, the nearest a hamlet stands to a town falls from 2.13, 2.04 and 2.00 world cells to 1.91, 1.79 and 1.66, to another hamlet from 1.91, 1.93 and 2.91 to 1.75, 1.77 and 2.26, and at band 5 to a farmstead or mill from 0.47 to 0.36, under the 0.45 a farm keeps from a hamlet's place in the world (`FARMSTEAD_SPACING_WORLD_CELLS` in `src/society/farmsteads.ts`). And a seated hamlet no longer stands in one place as the reader pans and descends: over the 112 flagged hamlets two or more census windows hold, its drawn spot strays a median 0.17 world cells between them (0.06 today), 0.42 at the 90th percentile (0.11), and up to 2.29 (0.32); 10 stray more than half a world cell (`976-spread.ts`, `976-probe/spread.out`). The plate read over four pairs of stills (today and seated; `out/976/plate-read/results.md`): 19 hamlet dots move, by up to 72.6 px at band 3 and 166.4 and 279.6 px at band 5 (Trunsvynsk, Che); every one lands 4.1 to 6.3 px from the water it is seated by, where none stood nearer than 12.1 px to a river or 23.8 px to a coast before; Trunsvynsk's name then straddles the coast (10.0 px of it inside the name's box) and Tzicui's touches it (1.5 px), while Gydpo's comes off a road (12.0 px today); every name is still drawn, four flip to the other side of their dot, and no dot comes within 10 px of another mark. It reaches past the hamlets: a water name moves 26.0 px (THE HAUWAIWA ATOLLS, chart 42), a compass rose 8.55 px (chart 2) and terrain marks reflow round the moved dots.
7. **Where the river half stands** (the comment): `onRiver` is computed from `world.riverCells` in `shoreAndRiver` and never re-resolved; Issue #953's pull request 2 seated only projected towns (`seatProjected` in `src/world/seat-settlements.ts`, called from `projectSettlements` in `src/world/region.ts` alone). Recon: CURRENT.

## Specs

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail": "A region's hamlets are grown on a FIXED world-space lattice" (extended here), "Below the hamlets, farmsteads and mills grow from band 5's window size" (the mill reads a drawn river on the close-up, the precedent this follows, and its "can differ between two overlapping windows"), "A projected harbour or river town stands on the region's own shore or river" (its last sentence rewritten here), "A region-only change leaves the world sheets byte-identical".
- `handbook/specs/engine-invariants.md`, "Engine outputs a consuming surface must respect" (no surface reads a hamlet's flag today; the rule for one that will is written into the region spec's hamlet bullet, its one home) and "Measuring a world in a script" (the census builds each world with `defaultRecipe(seed)` and samples grid space).
- `handbook/specs/rulebook.md`, "Golden and committed-chart discipline": no world sheet, committed chart, golden or seed moves, and the bound atlas's regional plates are band 2's windows (`regionPlateSpec` in `src/atlas/compose.ts`), wider than `HAMLET_MAX_WINDOW_UV`, so they grow no hamlet.
- `handbook/specs/check-placement.md`, "The unit suite" (every test here runs the code; no test reads a source file).
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" and "How code is cited" (the two spec edits).
- `handbook/specs/development-workflow.md` step 11: the still judge's comparison is owed (the diff touches `src/society/` and `src/world/`) though no world sheet changes.

## Facts (measured)

Every number was measured on this tree at `2f66e4ee` with no source edited, by scripts in the scratchpad, `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/5fbd4015-d487-49de-a4fd-007109c94984/scratchpad/`, written as `<scratch>` below:

- **The census**, `node <scratch>/976-census.ts <tree root> <out.json>` (11 min 37 s), then `node <scratch>/976-summary.ts <out.json>`: charts 42, 7, 2, 15, 23, 3 and 11; at bands 3, 4 and 5, the Explorer's close-up (`lodWindowFor(quantizeCenter(...))`, 320 by 240, detail on, one chain cache a chart) at each chart's first twelve towns and every other harbour town: 525 windows, 2,176 hamlet appearances. For each hamlet it reads today's flags, the close-up's own water and rivers beside its drawn cell (8-neighbours, the world's own test), and the cell `seatProjected` would give it over the laid rivers (`laidRiverCount` in `scripts/region-detail/feature-match.ts`) with `seatReach`. Its output: `<scratch>/976-probe/census.json`, `<scratch>/976-probe/summary-today.out`. Its acceptance line today: `hamlets whose harbor flag differs from the close-up's water beside them 227; whose onRiver flag differs from a drawn river on or beside them 162; of 2176`. The same hamlet in two windows: re-read, its harbour flag differs between them for 1 of 548 hamlets and its river flag for 5 (the world's flags for 0, which says the grouping by name and place is sound).
- **The byte check**, `node <scratch>/976-bytes.ts <tree root>`: `sheets and manifests compared 75, differing 0, hamlets whose flags change 20`, exit 0 (`<scratch>/976-probe/bytes.out`).
- **The fixture**, `node out/976/fixture-probe.ts` in this tree (`out/976/fixture-probe.log`): chart 42's band-3 window at its town Paukilua, `{ u0: 0.34375, v0: 0.65625, u1: 0.46875, v1: 0.78125 }`, holds 20 hamlet candidates, 3 the world puts by water (Taumotai, Nungnui, Taihonoa) and 2 on a river (Raukona, Rau), their projected cells at least 18 cells apart (Chebyshev), x from 49 to 310 and y from 5 to 219. Its close-up (detail on, 1.16 s) places all 20; none stands beside the close-up's water, and one, Raukona, stands beside a drawn river. Chart 2's window that `test/society/hamlets.test.ts` uses for Issue #399 holds 5 candidates, none flagged, so it cannot red a stub that passes the world's flags through.
- **The sheet writer**, `node <scratch>/976-sheets.ts <tree root> <out dir>`: `sheets 240, manifests 60, hamlets on them 305`; two runs of today's code, `diff -rq` exit 0 over 300 files.
- **The stills**, `node out/976/spike/stills.ts '<shots>'` in this tree: `out/976/stills/`, today's close-up and the seated one, antique, key and beast on, 1500 px; the plate read over them is `out/976/plate-read/results.md`.

## The design (option (b), as ruled)

**A hamlet's two flags describe the close-up it is drawn on.** `placeHamlets` (`src/society/hamlets.ts`) takes the close-up's land, `{ elev, seaLevel, riverCells }`, the shape `placeFarmsteads` takes, and after snapping each candidate to land as today it sets:

- `harbor`: an 8-neighbour of the hamlet's drawn cell is the close-up's water (`besideWater` in `src/world/seat-settlements.ts`);
- `onRiver`: the drawn cell or an 8-neighbour carries a river the close-up draws, laid or extracted (`onOrBesideRiver`, the same file, over `riverCells`).

No hamlet moves, and nothing drawn changes (Fact 4). The world-resolution walk `shoreAndRiver` and the two fields of `HamletCandidate` it fills are deleted: once `placeHamlets` reads the close-up, nothing reads them, and the walk draws no random number, so no stream moves (`hamletAtPoint` keeps its draw order: `roll`, `ju`, `jv`, then the `name` and `age` forks). The two helpers are exported from `src/world/seat-settlements.ts` rather than written a third time: they are the very test `seatProjected` uses for a town standing by water or a river, and `src/society/hamlets.ts` already imports from `src/world/`.

A flag read on the close-up can differ between two windows that hold the same hamlet (Fact: 1 harbour and 5 river flags of 548 hamlets), as a mill can (`placeFarmsteads`); the spec says so.

### Alternatives rejected

- **(a) Seat a flagged hamlet on the close-up's shore or river with `seatProjected`**, the issue's own candidate, Q1 (a), ruled against: a hamlet's site was never chosen for its water (`hamletSite` scores slope and ground alone, where `siteScore` in `src/society/sites.ts` adds 2.2 for a harbour and 1.6 for a river, which is why Issue #953 seated the towns), so seating invents a reason the world never gave; it moves 388 of 424 flagged hamlet appearances, at band 5 by up to about 280 px; and it unpins the hamlet's drawn spot from the window, by up to 2.29 world cells as the reader pans or descends (Fact 6).
- **(c) Leave both flags and close the issue** as latent, Q1 (c), ruled against: no work, and the first surface to read a hamlet's flag inherits 389 wrong flags in 2,176.
- **Set both flags false on every hamlet**, as a farmstead's `harbor` is: the same work as (b), and false for the 22 world-harbour hamlet appearances that do stand by the close-up's water.
- **Clear a flag only when no water lies within the harbour reach** (the issue's alternative wording): keeps the flag for a hamlet up to 2.12 world cells off the water, which still stands off it; reading the drawn cell is the same work and says what is drawn.
- **Laid rivers only** (the mask a projected town is seated by): `onRiver` on a town names the world's river it was sited by, so its seat chases that river; a hamlet's flag now describes the sheet, where a reader cannot tell a laid river from an extracted one, and the mill reads every drawn river. The two agree on every census hamlet (Fact 5).
- **The mill's reach** (`MILL_REACH_WORLD_CELLS`): the 8-neighbour is the world's own definition of both flags (`siteNeighbourhood` in `src/society/sites.ts`) and the seat's definition of standing beside; the mill's reach is that tier's own ruled number.
- **Keeping `shoreAndRiver` and the candidate's fields**: a world-resolution flag left computed with nothing reading it is the trap this issue is about.
- **Writing the neighbour test again in `src/society/hamlets.ts`**: a third copy of a walk two functions already hold (`npm run copy-hunt` would find it).

## Files

- `src/world/seat-settlements.ts` (129 lines, unchanged in length): `function besideWater(` (line 77) becomes `export function besideWater(`, and `function onOrBesideRiver(` (line 81) becomes `export function onOrBesideRiver(`. Their signatures stay: `besideWater(elev: Field, seaLevel: number, x: number, y: number): boolean`, `onOrBesideRiver(riverCells: Uint8Array, w: number, h: number, x: number, y: number): boolean`. Nothing else changes.
- `src/society/hamlets.ts` (232 lines, about 214 after), at the second commit:
  - line 2 becomes `import type { Field } from "../core/grid.ts";` (`NEIGHBORS_8` is read only by `shoreAndRiver`);
  - after line 6 add `import { besideWater, onOrBesideRiver } from "../world/seat-settlements.ts";`;
  - `HamletCandidate` (lines 30 to 38) loses `readonly harbor: boolean;` and `readonly onRiver: boolean;`;
  - `shoreAndRiver` (lines 124 to 138) and the blank line after it are deleted;
  - in `hamletAtPoint`, line 166 (`const { harbor, onRiver } = shoreAndRiver(world, wx, wy);`) and the blank line after it are deleted, and line 174 becomes `return { u, v, name, score, founded };`;
  - `placeHamlets` becomes:
    ```ts
    export function placeHamlets(
      world: World,
      window: UvWindow,
      land: { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array },
    ): NamedSettlement[] {
      const candidates = hamletCandidates(world, window);
      if (candidates.length === 0) return [];
      const { elev, seaLevel, riverCells } = land;
      const gridW = elev.w;
      const gridH = elev.h;
      // ...today's du, dv, radius and loop, unchanged, with in the pushed object:
      //   harbor: besideWater(elev, seaLevel, cell.x, cell.y),
      //   onRiver: onOrBesideRiver(riverCells, gridW, gridH, cell.x, cell.y),
    }
    ```
    No comment is added (the comment above is the plan's, not the file's).
- `src/world/region.ts` (358 lines, 357 after): in `regionPeople`, line 279 (`const { elev, seaLevel } = land;`) is deleted, and the hamlet call (lines 286 and 287) passes the land whole, `placeHamlets(world, window, land)`, the way line 288 hands it to `placeFarmsteads`. `land` is today's `RegionLand`, so `riverCells` is every drawn river. The formatter's wrapping of that line is `npm run format`'s.
- `test/society/hamlets.test.ts` (350 lines, unchanged in length): line 169 becomes `assert.deepEqual(placeHamlets(world, win, region), hamlets);` (a region world carries `elev`, `seaLevel` and `riverCells`, the same `riverCells` `generateRegionWorld` handed its own call), and line 345 becomes `const placed = placeHamlets(world, window, { elev, seaLevel: 0, riverCells: new Uint8Array(320 * 240) });`.
- `test/society/hamlet-flags.test.ts` (new, about 130 lines): the tests below. A new file because `test/society/hamlets.test.ts` is 350 lines.
- `test-support/on-or-beside.ts` (new, 12 lines): the test oracle `onOrBeside`, moved word for word from `test/world/seat-settlements.test.ts` (lines 30 to 38) with its first parameter widened from `World` to the part it reads, so the new test file can share it (`vellum-footguns` Gate 1 item 8: a shared helper lives in `test-support/`, and a test never imports a sibling test):
  ```ts
  import { NEIGHBORS_8 } from "../src/core/grid.ts";

  export function onOrBeside(
    grid: { readonly elev: { readonly w: number; readonly h: number } },
    at: { readonly x: number; readonly y: number },
    hit: (i: number) => boolean,
  ): boolean {
    const { w, h } = grid.elev;
    // ...today's body, unchanged
  }
  ```
  A world or a region world passes as it is.
- `test/world/seat-settlements.test.ts` (255 lines, about 245 after): delete `onOrBeside` (lines 30 to 38) and the blank line after it; add `import { onOrBeside } from "../../test-support/on-or-beside.ts";` beside the other `test-support` import (line 16); line 3 becomes `import { createField } from "../../src/core/grid.ts";` and line 14 (`import type { World } from "../../src/world/types.ts";`) is deleted, both read only by the moved function. Its four calls (lines 213, 228, 232 and 252) stay as they are.
- `handbook/specs/region-and-voyage.md`: two bullets (Rosters and doctrine).
- `handbook/plans/900/976/976-plan.md`: this plan, copied unchanged.

`git grep -n -e placeHamlets -e shoreAndRiver -e HamletCandidate -- src test scripts e2e test-support` names `src/society/hamlets.ts`, `src/world/region.ts` and `test/society/hamlets.test.ts` today, and no file reads a candidate's `harbor` or `onRiver` (`scripts/region-detail/probes.ts`, `scripts/region-detail/sweep-measure.ts`, `test/society/farmsteads.test.ts`, `test/world/region.test.ts` and `e2e/suites/zoom/` read a candidate's place, name or count). Nothing else imports `besideWater` or `onOrBesideRiver`.

## Tests, in the order they are written

All in `test/society/hamlet-flags.test.ts`. Its fixture, at the top of the file:

```ts
const world = generateWorld(defaultRecipe(42));
const WINDOW: UvWindow = { u0: 0.34375, v0: 0.65625, u1: 0.46875, v1: 0.78125 }; // chart 42's band-3 close-up at Paukilua
const W = 320;
const H = 240;
const candidates = hamletCandidates(world, WINDOW);
```

and these helpers in the file (the oracle is `onOrBeside` from `test-support/on-or-beside.ts`, never the code under test):

- `cellOf(c: { readonly u: number; readonly v: number }): { x: number; y: number }`: `x = Math.round(((c.u - WINDOW.u0) / (WINDOW.u1 - WINDOW.u0)) * (W - 1))`, `y` likewise over `v`, `WINDOW.v0`, `WINDOW.v1` and `H - 1`.
- `const at = (x: number, y: number): number => x + y * W;`
- `landWith(water: ReadonlySet<number>): Field`: `createField(W, H, (x, y) => (water.has(at(x, y)) ? -1 : 1))`; the sea level is `0`.
- `riversAt(cells: ReadonlySet<number>): Uint8Array`: a fresh `Uint8Array(W * H)` with 1 at each index.
- `worldCell(c)`: `{ x: Math.round(c.u * (world.recipe.gridW - 1)), y: Math.round(c.v * (world.recipe.gridH - 1)) }`; `worldShore(c)`: `onOrBeside(world, worldCell(c), (i) => (world.elev.data[i] as number) <= world.seaLevel)`; `worldRiver(c)`: `onOrBeside(world, worldCell(c), (i) => world.riverCells[i] === 1)`. These are the world's own reading of the two flags (a candidate's world cell is land, so on or beside water is beside it), kept as the preconditions' oracle once `shoreAndRiver` is gone.

Imports: `test`, `assert`, `createField` and `type Field` from `src/core/grid.ts`, `defaultRecipe` and `generateWorld` from `src/world/generate.ts`, `generateRegionWorld` from `src/world/region.ts`, `hamletCandidates` and `placeHamlets` from `src/society/hamlets.ts`, `type UvWindow` from `src/terrain/heightfield.ts`, `onOrBeside` from `test-support/on-or-beside.ts`.

**The stub of the first commit** (right shape, today's answer): `placeHamlets` takes the new `land` parameter and reads `elev` and `seaLevel` from it, and still writes `harbor: c.harbor, onRiver: c.onRiver` from the candidate; `shoreAndRiver` and the candidate's fields stay. `src/world/seat-settlements.ts`, `src/world/region.ts`, `test/society/hamlets.test.ts`, `test-support/on-or-beside.ts` and `test/world/seat-settlements.test.ts` are complete. Every close-up at this commit is today's.

1. `"a hamlet on a close-up is a harbour exactly when water lies beside the cell it is drawn on (Issue #976)"`. Preconditions: `candidates.length` is at least 10; `candidates.some(worldShore)` and `candidates.some((c) => !worldShore(c))`. Dry: `placeHamlets(world, WINDOW, { elev: landWith(new Set()), seaLevel: 0, riverCells: riversAt(new Set()) })` has `candidates.length` hamlets and every one `harbor === false`. Wet: water at `at(x + 1, y + 1)` of each candidate's `cellOf`, no rivers; every hamlet stands at its candidate's `cellOf` (`x` and `y`, a precondition that the snap left it there) and has `harbor === true`. Each message names the hamlet. Red on the stub at the dry arm's first world-shore hamlet (3 of 20) and at the wet arm's first hamlet that is not (17 of 20). Mutations: `besideWater` tests the four side neighbours only (the wet arm reds: its water is diagonal); `harbor: true` in `placeHamlets` (the dry arm reds).
2. `"a hamlet on a close-up is on a river exactly when a drawn river runs on or beside its cell"`. Preconditions: `candidates.some(worldRiver)` and `candidates.some((c) => !worldRiver(c))`. All land throughout. None: no rivers, every `onRiver === false`. Beside: a river at `at(x - 1, y + 1)` of each candidate's cell, every `onRiver === true`. On: a river at `at(x, y)` only, every `onRiver === true`. Red on the stub at the none arm's first world-river hamlet (2 of 20) and at the beside arm's first that is not. Mutations: `onOrBesideRiver` drops its own-cell test (`riverCells[x + y * w] === 1 ||`; the on arm reds); `onOrBesideRiver` keeps only the own-cell test (the beside arm reds); `onRiver: true` in `placeHamlets` (the none arm reds).
3. `"a hamlet's flags are read at the cell it is drawn on, not the cell it projects to"`. Land only at x from `cx + 5` to `cx + 8` and y from `cy - 2` to `cy + 2` round each candidate's cell `(cx, cy)`, water everywhere else; a river at `at(cx, cy)` of each. Every candidate is placed (count), at `(cx + 5, cy)` (the snap's first land cell, inside its reach of 8, as Issue #399's test in `test/society/hamlets.test.ts` relies on), with `harbor === true` (its west neighbour is water) and `onRiver === false` (the river lies 5 cells off). Red on the stub at the first hamlet the world keeps from the water (17 of 20). Mutation: `placeHamlets` reads both flags at the projected `(gx, gy)` instead of `cell` (`onRiver` turns true; the test reds).
4. `"on chart 42's band-3 close-up at Paukilua, every hamlet's flags say what the close-up draws beside it (Issue #976)"`, the driving check through the pipeline: `generateRegionWorld(world, { window: WINDOW, gridW: W, gridH: H, title: "t", detail: true })`; its hamlets (`kind === "hamlet"`). Preconditions: as many hamlets as `candidates` (20); `candidates.filter(worldShore).length` (3) is greater than the number of hamlets with the close-up's water beside them (0), so a hamlet the world puts by the sea stands off the close-up's water here, the issue's case; and some hamlet stands on or beside a drawn river (`region.riverCells`; Raukona). Then for every hamlet, `harbor` equals `onOrBeside(region, h, (i) => (region.elev.data[i] as number) <= region.seaLevel)` (a hamlet's drawn cell is land, so this reads its neighbours) and `onRiver` equals `onOrBeside(region, h, (i) => region.riverCells[i] === 1)`, each message naming the hamlet and its cell. Red on the stub at Taumotai (`harbor` true, no water beside). Mutations: `onRiver: false` in `placeHamlets` (Raukona reds); `regionPeople` passes `{ ...land, riverCells: new Uint8Array(land.riverCells.length) }` to `placeHamlets` (Raukona reds).

**Not pinnable, and named so**: which river mask `regionPeople` hands `placeHamlets` (every drawn river, or the laid ones alone). No census hamlet tells them apart (Fact 5), so the mutation `placeHamlets(world, window, { ...land, riverCells: land.laidRiverCells })` stays green on every world measured; the pull request body names it as unproven, with Fact 5 as the reason, rather than inventing a fixture.

**Proof**: `vellum-guard-prover`'s one round takes tests 1 to 4 with the mutations named; a mutation it does not reach inside its budget is named unproven in the pull request body (`CLAUDE.md`, Process). The two call updates in `test/society/hamlets.test.ts` are not guards.

Cost in the suite: one `generateWorld` and one close-up (1.16 s measured), a few seconds; a file joins `UNIT_SECONDS` (`scripts/unit-shards.ts`) only once CI's own logs measure it at 5 s or more, which is not this pull request's to write.

## Order of commits

1. `#976 The hamlet-flag plan, and a hamlet's flags read on the close-up (red)`: `handbook/plans/900/976/976-plan.md`; `src/world/seat-settlements.ts`; `src/society/hamlets.ts` with the stub; `src/world/region.ts`; `test/society/hamlets.test.ts`; `test-support/on-or-beside.ts`; `test/world/seat-settlements.test.ts`; `test/society/hamlet-flags.test.ts` complete. Red: tests 1 to 4, each on the assertion named; green: every other test, `test/world/seat-settlements.test.ts`'s three witnesses on the moved helper included.
2. `#976 A hamlet's harbour and river flags are read where it is drawn`: the real `placeHamlets`, `shoreAndRiver` and the candidate's two fields deleted, line 2's import narrowed. All green.
3. `#976 The spec reads a hamlet's flags on the close-up`: `handbook/specs/region-and-voyage.md`.

## Rosters and doctrine

No roster is joined (`npm test` collects the new file by its name; `UNIT_SECONDS` names files of 5 s or more). Two edits in `handbook/specs/region-and-voyage.md`:

- The bullet opening "**A region's hamlets are grown on a FIXED world-space lattice**" gains, after "independent of the window and of the order the reader interacted.", the sentence:

  ```
  Its `harbor` and `onRiver` flags are read where it is drawn, from the close-up's own water and
  every river it draws beside the hamlet's cell (`placeHamlets` in `src/society/hamlets.ts`), so like a mill they can
  differ between two overlapping windows, and a surface that quotes one quotes the close-up it read.
  ```

- The bullet opening "**A projected harbour or river town stands on the region's own shore or river.**" ends today "A region hamlet is not seated: its `harbor` flag (Issue #976) and its `onRiver` flag stay at world resolution." That sentence becomes:

  ```
  A region hamlet is not seated, since nothing in its site's score asks for water: its flags are read
  where it is drawn instead (the hamlet bullet above).
  ```

Each is wrapped by hand at the file's width, as the lines round it are.

## What moves

Nothing drawn: no close-up, no place card, no world sheet, committed chart, golden or seed (Fact 4; Evidence below). What changes is data no surface reads today: 389 of 2,176 hamlet appearances on the census windows carry a flag that turns from true to false.

**The parallel lanes**: none of the four lanes named in the dispatch (Issue #1253, Issue #422, Issue #962, Issue #1108 with Issue #1109) edits a file this plan names. Two can move its numbers: Issue #1108 and Issue #1109 may edit `src/terrain/lobes.ts`, which moves chart 42's terrain and so the fixture's counts and every census figure, and Issue #962 edits the blocklist in `src/society/names.ts`, which names hamlets (`hamletName` drops a point whose names run out, so a count can move; no test here reads a hamlet's name). The two regens (Issue #422, Issue #1108 and Issue #1109) do not touch this plan's files or its tests; this one owes no regen. The orchestrator's merge order (relayed 2026-11-13, the orchestrator's own condition and not a ruling of Alex's): this pull request merges before Issue #1108 and Issue #1109's where that lane touches `src/terrain/lobes.ts`; and Issue #962 was ruled to its standalone-check option, which by the orchestrator's account cannot touch seed 42 and does not change its hamlet counts. That is the orchestrator's claim, not measured here, so the fixture stop condition below still holds against it.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate` (the suite deletes the generated assets).
- The golden and the drift guard: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts` green, and `git diff --stat origin/main -- src/static/` empty.
- **Nothing drawn moves**: before the first commit, `node <scratch>/976-sheets.ts <the tree's absolute root> <the tree's absolute root>/out/976-sheets-before`, and after the second, the same into `out/976-sheets-after`; each prints `sheets 240, manifests 60, hamlets on them 305` (four harbour-town close-ups a band, bands 3 to 5, of charts 42, 7, 2, 15 and 23, in all four styles), and `diff -rq` of the two folders prints nothing. Its control was measured: two runs of today's code into two folders, `diff -rq` exit 0 over 300 files. Both runs on this machine and this Node (`handbook/specs/rulebook.md`: never compare across environments). The pull request body quotes both lines and the empty diff.
- **The acceptance**: after the second commit, `node <scratch>/976-census.ts <the tree's absolute root> <the tree's absolute root>/out/976-census.json` (about 12 minutes; run it while no other lane's suite runs), then `node <scratch>/976-summary.ts <the tree's absolute root>/out/976-census.json`; its first line reads `windows 525, hamlet rows 2176` and its acceptance line `hamlets whose harbor flag differs from the close-up's water beside them 0; whose onRiver flag differs from a drawn river on or beside them 0; of 2176` (today 227 and 162). The body quotes both, and today's line beside them. Its other lines read a hamlet's flags as the world's and are not quoted.
- The e2e suite that loads `src/society/hamlets.ts` in the browser (`e2e/suites/zoom/bands.ts` and `e2e/suites/zoom/registration.ts` import it through the engine route): `npm run build`, then `VELLUM_E2E_SUITES=zoom npm run test:e2e`. Never the full lanes.
- **`vellum-plate-reader` is owed at step 11 for the still judge's comparison alone** (`handbook/specs/development-workflow.md` step 11: the diff touches `src/society/` and `src/world/`); no world sheet changes, so each of its five charts should read as today's. No plate read of an appearance is owed: nothing drawn changes.

## Calls made

The implementer copies these into its step 12 comment.

1. **Both flags are read with the 8-neighbour test on the close-up's own grid**, `besideWater` and `onOrBesideRiver` from `src/world/seat-settlements.ts`: the world's own definition of the two flags (`siteNeighbourhood` in `src/society/sites.ts`) and the seat's definition of a town standing by water or a river, not the mill's reach, which is that tier's own ruled number.
2. **A hamlet is on a river when a river the close-up draws runs on or beside it, laid or extracted**: the flag now describes the sheet, a reader cannot tell the two kinds apart, and the mill reads every drawn river; a projected town is seated by the laid rivers because its flag names the world river it was sited by. The two agree on every census hamlet, so no test can pin the choice, and the body says so.
3. **`shoreAndRiver` and `HamletCandidate`'s `harbor` and `onRiver` are deleted**: nothing reads them once `placeHamlets` reads the close-up, and the walk draws no random number.
4. **The helpers are exported from `src/world/seat-settlements.ts`, not written again**: one neighbour test for standing by water, in one file.
5. **`placeHamlets` takes `{ elev, seaLevel, riverCells }`, the shape `placeFarmsteads` takes**, and `regionPeople` passes its `land` whole to both.
6. **The tests stand on chart 42's band-3 close-up at Paukilua**, a census window on the hero chart holding hamlets the world puts by water that stand off the close-up's, a world-river hamlet and a hamlet beside a drawn river, at 1.16 s for the close-up; chart 2's Issue #399 window holds no flagged candidate and could not red the stub. No test pins a hamlet by name (Issue #962 is renaming names).
7. **Two new files, named here for Alex to overrule**: `test/society/hamlet-flags.test.ts`, since `test/society/hamlets.test.ts` is 350 lines; and `test-support/on-or-beside.ts`, the test oracle `onOrBeside` moved out of `test/world/seat-settlements.test.ts` so the new tests share it rather than write the neighbour walk a fourth time (it stands today in `besideWhere` in `src/world/seat-settlements.ts`, in `shoreAndRiver`, which goes, and in that test). It moves word for word, so the copy hunt reads the same body it reads today.
8. **The spec says a hamlet's flags can differ between two windows**, as it says of a mill, rather than promising a window-independence the census shows does not hold (1 and 5 of 548).

## Open decisions

None. Q1 is ruled (b), read the flags where the hamlet is drawn (Rulings, above); options (a), seat the hamlet, and (c), leave both and close the issue, were ruled against and stay under Alternatives rejected. The stills Alex ruled from are `out/976/` in the main checkout.

## Stop conditions

- `src/society/hamlets.ts` at the base is not the 232 lines described (`shoreAndRiver` at lines 124 to 138, its call at line 166, the return at line 174, `placeHamlets(world, window, elev, seaLevel)` at line 203), `besideWater` and `onOrBesideRiver` are not at lines 77 and 81 of `src/world/seat-settlements.ts` with the signatures quoted, or `regionPeople` in `src/world/region.ts` does not destructure `elev` and `seaLevel` from `land` at line 279 and call `placeHamlets` at lines 286 and 287.
- `git grep -n -e placeHamlets -e shoreAndRiver -e HamletCandidate -- src test scripts e2e test-support` names a file beyond the three above, or anything reads a candidate's `harbor` or `onRiver`.
- `onOrBeside` in `test/world/seat-settlements.test.ts` is not the nine lines at 30 to 38 over `NEIGHBORS_8`, `NEIGHBORS_8` or the `World` type is read anywhere else in that file, or `test-support/on-or-beside.ts` already exists.
- The fixture is not as measured: `candidates` on `WINDOW` is not 20, or not 3 by `worldShore` and 2 by `worldRiver`; two candidate cells stand nearer than 10 cells (Chebyshev); a candidate cell has `x` above 311 or below 1, or `y` above 237 or below 2 (test 3's land block reaches 8 cells right and 2 up and down, test 2's river 1 cell left); the close-up does not place 20 hamlets, or puts one beside its water, or none beside a drawn river. A lane that merged first (Issue #1108 or Issue #1109 through `src/terrain/lobes.ts`, Issue #962 through `src/society/names.ts`) moving any of these is a hand-back, never a new window chosen by the builder.
- A test this plan does not name goes red, the golden and the hero drift guard above all.
- `diff -rq` of the two sheet folders prints anything, or either sheet run prints other than `sheets 240, manifests 60, hamlets on them 305`.
- The census prints other than `windows 525, hamlet rows 2176`, or an acceptance count other than 0 and 0 after the second commit.
- A named mutation does not red its test.
- The zoom suite goes red on a check that reads hamlets.
