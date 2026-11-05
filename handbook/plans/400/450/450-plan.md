# Issue #450 plan: the bound atlas's regional plates are drawn as the Glass draws them

**Planned at**: `origin/main` `7200fdbbd08acb38993d1d283e98dc4afeb9ccd5`; Issue #450 read at 2 comments: 5386562439 (2026-08-23, which records only that Issue #400 left `src/atlas/compose.ts` bare on purpose) and 6645788576 (Alex's rulings, 2026-11-05).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/450#issuecomment-6645788576, Alex's answers to this plan's three-item menu, quoted as he chose them:

1. What the two regional plates show: "Glass's second close-up, quarter-chart wide (Recommended)".
2. Whether each plate carries its own recipe note: "Yes (Recommended)".
3. Town marks on the plates: "Accept the growth (Recommended)".

He overruled none of Calls 1 to 11. Ruling 1 is a feel ruling made from stills, so it is provisional until the post-use review (`handbook/specs/conventions.md`, "Feel decisions are provisional"). Rulings 2 and 3 follow from it.

**One pull request.** Nothing in the recon or the measurements splits it.

**Recon** (`vellum-spec-recon`, 7200fdbb) found 16 claims CURRENT, 5 STALE and 3 UNVERIFIABLE. All five STALE claims are cosmetic:

- `public/atlas/` is now `generated/atlas/`.
- `public/charts/*` and `public/og.png` now live under `src/static/`.
- The scripts are `scripts/region-detail/cost.ts` and `scripts/region-detail/renders.ts`.
- `lodWindowFor`'s precondition is now stated in its doc comment.
- The Print Room composes off the main thread, but the reader still waits.

I settled the three UNVERIFIABLE claims myself:

- **"Nothing tests the chain at an off-lattice window" is STALE.** `test/world/detail-chain.test.ts` holds "the atlas window chains, at the depth its own size implies (#398)", on a centred 0.38 window. That halves the issue's reason 1.
- **The issue's cost figures are replaced** by fresh measurements, below.
- **"Four bands" is history:** `LOD_BANDS` holds six now. It does not touch this issue.

## Specs

Read these first, at these sections, on top of what `CLAUDE.md`'s table owes:

- `handbook/specs/region-and-voyage.md`, Region worlds and level of detail, the bullets:
  - "The region stamp is GEOMETRIC only"
  - "The detail level is a function of the WINDOW"
  - "A window off the band lattice gets none of a band-parameterized guard's coverage" (this plan rewrites it)
  - "A parent is derived from the WINDOW alone"
  - "Hold ONE chain cache across region jobs"
  - "A region-only change leaves the world sheets byte-identical"
- `handbook/specs/chart-dress.md`: "On a close-up, a settlement's mark takes its tier's size on the ladder and grows with the survey's depth" (this plan edits one sentence of it).
- `handbook/specs/rulebook.md`:
  - "The cost axis and ordering principle"
  - "Golden and committed-chart discipline", the bullet "Some levers are golden-safe by construction" (a render gate only region sheets pass)
- `handbook/specs/check-placement.md`, The unit suite.
- `handbook/specs/settle-doctrine.md`, "When a check is pulled out of the run", the bullets "What a step holds" and "Who finds a slow step".
- `handbook/specs/conventions.md`:
  - "How a design decision is made" (the framing is a feel ruling, so it is provisional)
  - "How code is cited"
  - "The comment sweep" (only for the one comment this plan edits)

## Tier: cheap, nothing committed moves

Measured, not assumed:

- **The atlas is generated, not committed.** It is written to `generated/atlas/` by `buildAtlas` in `src/cli/atlas.ts`, called from `generateShowcases` in `scripts/generate-showcases.ts` at the end of `npm run astro:generate`. `/generated/` is in `.gitignore`.
- **No committed file reads it.** The committed charts are `src/static/charts/*`, from `scripts/regen-hero-charts.ts`, and `src/static/og.png` is from `scripts/build-og.ts`. Neither calls `composeAtlas`.
- **No test pins the plates' bytes.** `grep -rnE "region-[12]|\.regions\b|Environs" test e2e`, read by recon, finds only:
  - the regions count and keys in `test/atlas/compose.test.ts`;
  - the determinism `deepEqual` there;
  - the "Regional Surveys" heading in `e2e/suites/print-room/atlas.ts`;
  - the literal titles "The Environs of Laukuwelua" and "The Environs of Toatauhe" in `test/site/print-room-contents.test.ts`, which seed 42's plates keep (measured below).
- **World sheets are untouched.** The change is region-only. The world sheets, the golden `1792806240` and the committed charts stand still.

So no regen is owed, and no re-roll slot is taken.

## The design

**Each of the two regional plates becomes the sheet the Glass draws at its second close-up over the plate's town.** The atlas keeps its two anchors as today: the capital, then the town farthest from it. Each plate is then built as follows:

- **Window:** band 2's lattice window around the town, `lodWindowFor(q.cx, q.cy, 0.25)` with `q = quantizeCenter(u, v, 0.25)`. This is the window `decideSettle` in `src/world/lod.ts` settles on when the Glass is centred on that town at band 2.
- **Grid:** band 2's own grid, 320 by 240.
- **Field:** drawn from the detail chain (`detail: true`), so the region world carries detail 2.
- **Title:** derived from the window by `regionTitle`.
- **Stamp:** `regionRecipe` carries the window, the parent grid and the detail.

That is exactly what `answerRegion` in `src/site/explorer/worker.ts` and the region branch of `runInline` in `src/site/explorer/worker-client.ts` do for a Glass job. So a plate is byte-identical to the Glass's own sheet for that window under the atlas's render options (`style: "antique"`, `widthPx: width`, `legend: true`).

Both plates of one composition build in one chain cache made by `createChainCache()`, so the full-window ancestor they share is built once.

What moves, and what does not:

- **The worker and its client do not change.** Both already call `composeAtlas`, and e2e R3 (`e2e/suites/render.ts`) holds them byte-equal.
- **The world sheets do not change.**
- **The plates do change.** The coast is drawn at band 2's depth. Each settlement mark grows to band 2's size: the capital from 20.6 to 32.7 px and a town seat from 14.0 to 22.3 px, by the plate reader's measurement below. The frame is a quarter of the chart wide instead of 0.38. Each plate is stamped. Each plate is named for the town nearest its window's centre.

### Measured consequences (all on 7200fdbb, this machine, Node 24)

Before the timing runs, `pgrep -fl "node "` showed no other node process on the machine besides the editor's and the tools' own.

**Cost of the two plates per atlas.** Best of 3, with one chain cache shared across the two plates. From `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/450-cost-shared.ts`, log `450-cost-shared.log` beside it.

| seed | today | this design | delta |
|---|---|---|---|
| 42 | 741 ms | 1492 ms | +0.75 s |
| 2 | 693 ms | 1485 ms | +0.79 s |
| 15 | 712 ms | 1493 ms | +0.78 s |
| 23 | 685 ms | 1460 ms | +0.78 s |

A whole `composeAtlas` today costs 1107 to 1363 ms (`450-cost.log`), so the atlas grows by about 60%.

**On CI, where the Print Room binds an atlas.** Main's run 41793908846 (job 126453387802, lane A) took 5.1 s from PR20a to PR20 (07:48:59.0 to 07:49:04.1). PR20's poll budget is 300 polls of 50 ms, at least 15 s. At the 2 to 3 times the runner is slower than the Mac, the bind should land near 7 s.

**Title renames over seeds 1 to 200.** From `450-titles.ts`, log `450-titles.log`. The rename happens when the town nearest the window's centre is not the town the plate was centred on.

- This design renames **12 of 400 plates**. Seed 2's far-town plate is one: "The Environs of Nydstagrad" becomes "The Environs of Stan".
- No world has two plates under one title (0 of 200).
- No anchor falls in the 2% margin a region drops a settlement from (0 of 400), so the anchor is always drawn.

**Seed 42's two plates keep their names:** "The Environs of Laukuwelua" and "The Environs of Toatauhe".

**Plate reader**, over the spike in `out/450/` (16 plates, all rendered at 1500 px):

- 0 clipped labels and 0 label-on-label overlaps on this design's four plates.
- 0 labels under furniture on those four plates.
- The anchor is lettered on all four.

### Names on a corner panel: they do show at the second close-up, and they are not this issue's

At the Glass's first close-up, the plate reader saw two names on a corner panel: "Hong" under the key on seed 7, and "WEKI" on the scale bar on seed 42. The coordinator is filing them, outside this issue. I checked by command whether the same can happen on the second close-up the plates now use.

**The sweep.** `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-ae5f07fbc74268b13/out/450-sweep/sweep.ts`, run as `node out/450-sweep/sweep.ts 1 40` from the tree root at 7200fdbb. Its log is `out/450-sweep/sweep.log` and its rows are `out/450-sweep/sweep.json`, beside it.

- It draws this plan's two plates for seeds 1 to 40: 80 plates, through the same spec as `regionPlateSpec`.
- It renders each one in the browser through `shootAll` in `scripts/design/shoot.ts`.
- It lists every settlement name and every feature name whose box meets the box of the cartouche, the key, the compass or the scale bar.
- For each settlement name, it asks whether the settlement's own mark stands inside that panel too.
- **Witnesses:** the two first-close-up plates are drawn alongside. Both reproduce, as "Weki" on the scale bar and "Hong" under the key, and the sweep classes both as names whose own mark stands under the panel. So the sweep can see the case.

**The result.** On the 80 second-close-up plates, 5 names meet a panel, and 0 console errors:

- **Three town names, each with its town's own mark under the same panel**, the kind Hong and Weki are:
  - Lupuhau under the cartouche (seed 12, plate 1);
  - Stenernfjord under the key (seed 29, plate 2);
  - Nongroo under the key (seed 40, plate 2).
- **Two realm names lying on a panel:**
  - "FAIR ELEIBRAE" on the key (seed 16, plate 2);
  - "THE VLIDKRUN BALKA" on the cartouche (seed 33, plate 2).
- **No name strays onto a panel from a mark outside it.**
- **The hero world's two plates have none.**

**So yes, the same kind shows at the second close-up,** on about 1 plate in 16. It is the house's ruled behaviour for every close-up, not something this change brings:

- **A name whose settlement stands under a panel stands there with it, faded, as its mark does.** This is in `handbook/specs/chart-dress.md`, "On a close-up, a name stays whole on the sheet" (Alex, 2026-10-30, Issue #1105).
- **A realm name slid inside the sheet may lie whole on a corner panel.** That is Alex's Issue #1105 ruling 1, in comment 6536421348: "43 that ran off beside a corner panel now lie whole on that panel".
- The key is drawn over the map at a paper fill opacity of 0.82 (`legendPanel` in `src/render/layers/legend.ts`), which is why Hong reads as a faint ghost.

The plate reader's two first-close-up cases are this same ruled kind. Its two settlements' marks stand inside the panel's box:

- Hong's mark is at (1290.9, 841.9), inside the key's 1226 to 1416 by 782 to 1074.
- Weki's mark spans x 174.6 to 192.3 and y 1030 to 1043, inside the scale bar's 82 to 313 by 1028 to 1070.

The build does not touch any of this (Call 12).

### Alternatives rejected, with the reason

- **Keep the 0.38 window, drawn from the chain.** Alex ruled against it (ruling 1). Its measured case was:
  - The shore barely changes. Coast vertices move +3.1%, +1.5%, +0.3% and -1.3% on the four stills, and the plate reader saw the same shape at 1:1.
  - What changes visibly is the marks (20.6 to 26.0 px) and the title.
  - The window stays off the lattice, so no band-written guard reaches it.
  - It costs about as much as this design: 1389 to 1440 ms for the pair.
- **The Glass's first close-up, band 1.** Alex ruled against it (ruling 1). It is the cheapest arm, 970 to 1026 ms for the pair, but:
  - It renames 123 of 400 plates, because band 1's clamp pushes the window off the town.
  - The two plates overlap by up to 27%.
- **Leave the plates bare.** Alex ruled against it (ruling 1).
- **Leave the plates unstamped, named for their towns.** Alex ruled against it (ruling 2).
- **Stamp the plate but keep its anchor's name.** Rejected, never offered. It breaks "The region stamp is GEOMETRIC only" in `handbook/specs/region-and-voyage.md`: wherever the two names differ, a redraw from the stamp letters a different title.
- **Hold the Glass's own cache, `regionChainCache` from `src/site/explorer/region-chain-cache.ts`.** Rejected for three reasons:
  - The engine module `src/atlas/compose.ts` would import site code.
  - It would take 3 of the 14 slots the Glass sizes for its own ancestry.
  - The Print Room's worker runs no region job, so the cache would only ever serve a re-bind.
- **Keep the plate's marks at the ladder size while drawing at depth.** Alex ruled against it (ruling 3). It would also need a render-time override of the depth, and "whatever draws it reads the depth from the world, never from a band index or a render option" forbids that (`handbook/specs/region-and-voyage.md`, "The detail level is a function of the WINDOW").
- **A new browser check.** Rejected. Every claim here is engine output, which a unit test reads (`handbook/specs/check-placement.md`, The unit suite). The existing e2e checks already cover the bind, and the worker-to-inline parity of the composition (R3).

## Files

Nothing is created or deleted. Every file below is edited.

### `src/atlas/compose.ts` (233 lines now, about 255 after)

Imports:

- Drop `windowAround` from the `../world/region.ts` import.
- That import becomes `import { generateRegionWorld, regionDetailLevel, regionTitle, type RegionSpec } from "../world/region.ts";`.
- Add `import { LOD_BANDS, lodWindowFor, quantizeCenter, type LodBand } from "../world/lod.ts";`.
- Add `import { createChainCache, type ChainCache } from "../world/detail-chain.ts";`.
- Change `import type { World } from "../world/types.ts";` to `import type { NamedSettlement, World } from "../world/types.ts";`.

Then:

- **Add a module-local constant:** `const REGION_PLATE_BAND = LOD_BANDS[2] as LodBand;`. It is not exported, so the tests derive the window themselves.
- **Add a private `function regionPlateAnchors(world: World): NamedSettlement[]`.** It returns `[]` with no capital, `[capital]` with no town, and otherwise `[capital, far]`. Here `far` is today's reduce over the towns by `Math.hypot` from the capital, unchanged.
- **Add `export function regionPlateSpec(world: World, anchor: { readonly x: number; readonly y: number }, chainCache?: ChainCache): RegionSpec`.** It takes `q = quantizeCenter(anchor.x / (world.recipe.gridW - 1), anchor.y / (world.recipe.gridH - 1), REGION_PLATE_BAND.sizeUV)` and `window = lodWindowFor(q.cx, q.cy, REGION_PLATE_BAND.sizeUV)`. It returns `{ window, gridW: REGION_PLATE_BAND.gridW, gridH: REGION_PLATE_BAND.gridH, title: regionTitle(world, window), detail: true, chainCache }`. Its one-line doc comment reads: `/** The Glass's second close-up over a town: the plate is the sheet the Glass draws there (Issue #450). */`
- **Rewrite the private `regionPlates(world: World, width: number): AtlasPlate[]`** to this body:

```ts
function regionPlates(world: World, width: number): AtlasPlate[] {
  const chainCache = createChainCache();
  return regionPlateAnchors(world).map((anchor, i) => {
    const spec = regionPlateSpec(world, anchor, chainCache);
    const regionRecipe = { window: spec.window, worldGridW: world.recipe.gridW, detail: regionDetailLevel(spec) };
    return {
      key: `region-${i + 1}`,
      title: spec.title,
      svg: renderMap(generateRegionWorld(world, spec), { style: "antique", widthPx: width, legend: true, regionRecipe }),
    };
  });
}
```

- `composeAtlas` and every other function are unchanged.

### `src/world/region.ts` (Issue #421's lane owns this file)

Only line 28, the doc comment on `RegionSpec.detail`, changes.

- From: `/** Draw the terrain from the chained detail field (Issue #396-Issue #398) instead of the bare heightfield. Dark by default: Issue #400 turns it on for the Glass and leaves the atlas plates bare. */`
- To: `/** Draw the terrain from the chained detail field (Issue #396-Issue #398) instead of the bare heightfield. Dark by default: the Glass (Issue #400) and the bound atlas's regional plates (Issue #450) turn it on. */`

This one line is where the two lanes meet. Touch nothing else in the file.

### `test/atlas/compose.test.ts`

Add two tests (T1, T2 below), plus one helper and these imports:

- `import { createHash } from "node:crypto";`
- `recipeFromSvg` from `../../src/render/recipe-meta.ts`
- `renderMap` from `../../src/render/map-renderer.ts`
- `runInline` from `../../src/site/explorer/worker-client.ts`
- `lodWindowFor` and `quantizeCenter` from `../../src/world/lod.ts`
- `generateRegionWorld` and `regionTitle` from `../../src/world/region.ts`

Also import the types `World` from `../../src/world/types.ts` and `UvWindow` from `../../src/terrain/heightfield.ts`. Module-level helpers, placed after the imports. The digest is the form `test/site/region-detail-wiring.test.ts` uses.

```ts
const digest = (svg: string): string => `${createHash("sha256").update(svg).digest("hex").slice(0, 16)}/${svg.length}`;
const PLATE_RENDER = { style: "antique", widthPx: 1500, legend: true } as const;

function glassWindow(world: World, name: string): UvWindow {
  const s = world.settlements.find((t) => t.name === name);
  assert.ok(s, `${name} is a settlement of chart ${world.recipe.seed}`);
  const q = quantizeCenter(s.x / (world.recipe.gridW - 1), s.y / (world.recipe.gridH - 1), 0.25);
  return lodWindowFor(q.cx, q.cy, 0.25);
}
```

### Test files whose fixtures follow the atlas, or are renamed for what they cover

These are fixture or name edits only. No assertion's logic changes.

- **`test/render/close-up-names.test.ts`:**
  - In `STAL_PLATE`, replace the `generateRegionWorld(world, { window: windowAround(world, stal, 0.38), gridW: world.recipe.gridW, gridH: world.recipe.gridH, title: "The Environs of Stal" })` call with `generateRegionWorld(world, regionPlateSpec(world, stal))`.
  - Import `regionPlateSpec` from `../../src/atlas/compose.ts`.
  - Drop `windowAround` from the region import; `generateRegionWorld` stays.
  - The test "the bound atlas's regional plate clears its names too (chart 15, the plate round Stal)" keeps its name. It is now true of the real plate: Stal is chart 15's far town, and its derived title is "The Environs of Stal".
- **`test/world/region-roads.test.ts`:**
  - In `sheets()`, the row `{ name: "the atlas plate", region: closeUp(HERO, windowAround(HERO, capital, 0.38), false) }` becomes `{ name: "the atlas plate", region: closeUp(HERO, regionPlateSpec(HERO, capital).window) }`. `closeUp`'s default `detail` is `true`, and its grid is 320 by 240.
  - Import `regionPlateSpec` from `../../src/atlas/compose.ts`.
  - Drop the now-unused `windowAround` import line.
- **`test/world/realm-carry.test.ts`:**
  - In `sweepWindows`, `windows.push([seed, "atlas", windowAround(world, capital, 0.38)]);` becomes `windows.push([seed, "atlas", regionPlateSpec(world, capital).window, createChainCache(16)]);`. Passing a cache is how `collarSweep` draws a window chained.
  - Import `regionPlateSpec` from `../../src/atlas/compose.ts`.
  - Drop `windowAround` from the region import; `generateRegionWorld` stays.
- **`test/render/glyph-density.test.ts`:**
  - In "band 3's window, the atlas plate and a world sheet draw as before", `const plate = windowAround(world, capital, 0.38);` becomes `const plate = regionPlateSpec(world, capital).window;`.
  - Import `regionPlateSpec` from `../../src/atlas/compose.ts`.
  - Drop `windowAround` from the region import; `generateRegionWorld` stays.
  - Measured: `glyphDensity` gives `{ zoom: 2, capScale: 1 }` on the new plate, which is what the test's own formula gives (`450-glyph.ts`).
- **`test/world/detail-chain.test.ts`:**
  - Rename the test "the atlas window chains, at the depth its own size implies (#398)" to "an off-lattice window chains, at the depth its own size implies (#398)".
  - Delete its first-line comment, the one that begins `// The atlas plate window (windowAround(...`.
  - Rename the local `atlas` to `offLattice`, everywhere in that test.
  - In its two messages, change "on the atlas window" to "on the off-lattice window".
  - The 0.38 fixture stays. It is the one guard of a window that is not a band, and the stamp parser accepts any window.

### `scripts/region-detail/probes.ts`

Three lines change. Before:

```ts
const ATLAS_SIZE = 0.38; // `windowAround` in `src/atlas/compose.ts`
        `atlas ${ATLAS_SIZE}`,
        windowAround(world, anchor, ATLAS_SIZE),
```

After:

```ts
const OFF_LATTICE_SIZE = 0.38;
        `off-lattice ${OFF_LATTICE_SIZE}`,
        windowAround(world, anchor, OFF_LATTICE_SIZE),
```

### `handbook/specs/region-and-voyage.md`

Replace the bullet at lines 142 to 144.

From:

```
- **A window off the band lattice gets none of a band-parameterized guard's coverage.** The bound
  atlas's regional plate window is not one of the band sizes, so a guard written in bands never
  reaches it.
```

To:

```
- **A window off the band lattice gets none of a band-parameterized guard's coverage.** The bound
  atlas's regional plates stand on it: each is the Glass's second close-up over its town, band 2's
  window at band 2's grid, drawn from the chain, stamped, and titled from its window
  (`regionPlateSpec` in `src/atlas/compose.ts`), so it is the sheet the Glass draws there and the
  guards written in bands reach it.
```

### `handbook/specs/chart-dress.md`

Line 147 is one long line. Replace inside it, exactly, this text:

```
a bare survey, the bound atlas's regional plates among them, draws the ladder alone (`markGrowth` there, over the region world's `detail`).
```

with this text:

```
a bare survey draws the ladder alone (`markGrowth` there, over the region world's `detail`), and the bound atlas's regional plates, drawn at band 2's depth, grow as band 2 does.
```

## Tests, in the order they are written

Both tests go in `test/atlas/compose.test.ts`, in commit 1. Both are red on 7200fdbb as it stands, on their own assertions, with no stub: neither needs a new export, since each reads `composeAtlas(world).regions`.

### T1

**Name:** `"#450 each regional plate is the Glass's second close-up over its town, drawn as the Glass's own region job draws it"`

**Body:**

```ts
test("#450 each regional plate is the Glass's second close-up over its town, drawn as the Glass's own region job draws it", () => {
  const world = generateWorld(defaultRecipe(42));
  const plates = composeAtlas(world).regions;
  const towns = ["Laukuwelua", "Toatauhe"];
  assert.equal(plates.length, towns.length);
  plates.forEach((plate, i) => {
    const town = towns[i]!;
    const window = glassWindow(world, town);
    const glass = runInline({ kind: "region", seed: 42, overrides: {}, window, gridW: 320, gridH: 240, band: 2, render: PLATE_RENDER });
    assert.equal(digest(plate.svg), digest(glass.svg), `${town}'s plate is the Glass's band-2 sheet, cell for cell`);
    assert.equal(plate.title, glass.title, "and carries the Glass's own title");
  });
});
```

**Red today:** on the first digest. Today's plate is a 0.38 bare window, so the digests differ.

**Mutations, each red once green:**

- `detail: true` to `detail: false` in `regionPlateSpec`
- `LOD_BANDS[2]` to `LOD_BANDS[1]`
- dropping `regionRecipe` from the plate's `renderMap` options

### T2

**Name:** `"#450 a regional plate carries its stamp, and the stamp alone redraws it byte for byte, its title derived from its window"`

**Body.** The premise is independent of the composer; measured, the far-town plate's derived title is "The Environs of Stan".

```ts
test("#450 a regional plate carries its stamp, and the stamp alone redraws it byte for byte, its title derived from its window", () => {
  const world = generateWorld(defaultRecipe(2));
  assert.notEqual(
    regionTitle(world, glassWindow(world, "Nydstagrad")),
    "The Environs of Nydstagrad",
    "premise: chart 2's far-town plate is named for the town nearest its window's centre, or this pin cannot see a plate named for its anchor",
  );
  const plates = composeAtlas(world).regions;
  assert.equal(plates.length, 2);
  for (const plate of plates) {
    const parsed = recipeFromSvg(plate.svg);
    assert.ok(parsed, `${plate.title} carries its recipe`);
    const region = parsed.region;
    assert.ok(region, "and its region stamp");
    assert.equal(region.detail, 2, "stamped at band 2's depth");
    const reworld = generateWorld(parsed.recipe);
    const redrawn = renderMap(
      generateRegionWorld(reworld, {
        window: region.window,
        gridW: parsed.recipe.gridW,
        gridH: parsed.recipe.gridH,
        title: regionTitle(reworld, region.window),
        detail: region.detail > 0,
      }),
      { style: parsed.style, widthPx: 1500, legend: true, regionRecipe: region },
    );
    assert.equal(digest(redrawn), digest(plate.svg), `${plate.title} redraws from its stamp alone`);
  }
});
```

**Red today:** on `assert.ok(parsed, ...)`, because today's plate carries no recipe.

**Mutations, each red once green:**

- The plate titled for its anchor (`"The Environs of " + anchor.name`) in place of `regionTitle` reds on seed 2's second plate's redraw digest. T1 stays green under it, since seed 42's names agree, so this witness is the one that sees it.
- Dropping `regionRecipe` reds on `assert.ok(parsed)`.

### Both tests measured against the planned code, before the build

`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/450-t1t2-probe.ts` writes this plan's `regionPlates` out in a scratch file and runs both tests' reads against it, on 7200fdbb. Its log is `450-t1t2-probe.log` beside it.

- **T1:** seed 42's two plates equal the Glass job's sheets: `5d91c341c0a087e8/794548` for Laukuwelua and `e696d117d3a80195/532298` for Toatauhe. Their titles agree.
- **T2:** both seed 2 plates are stamped at detail 2 and redraw equal from their stamps.
- **T2's anchor-title mutation** is seen on Nydstagrad's plate, named "The Environs of Stan", where the mutant's digest differs from the redraw. It is not seen on Vunsvyov's, whose names agree, as the witness predicts.

### What is not guarded, named so nobody looks for it

- **The shared chain cache.** It is transparent by construction ("Hold ONE chain cache" in `handbook/specs/region-and-voyage.md`), so no byte comparison can see it being dropped. Its only effect is cost, measured above.
- **The plate taking band 2's grid in place of the world recipe's.** That is an equivalent mutation on every world the product builds an atlas from: 320 by 240 either way, since the CLI has no atlas command and the Print Room address carries no grid.

### Who proves what

- **`vellum-guard-prover` is owed T1 and T2**, with the five mutations above.
- **The five re-pointed fixtures** (close-up-names, region-roads, realm-carry, glyph-density, detail-chain) keep their guards unchanged. No guard there is new or strengthened, so the prover is not owed them. The implementer runs them green.
- **The re-pointed fixtures were measured green at 7200fdbb.** I ran the three whose inputs change (close-up-names, region-roads and realm-carry) as scratch copies with the band-2 plate swapped in: 19 tests, 19 pass. Log: `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/450-opt3/450-opt3.log`.

### Browser checks

**The plan adds none.** It makes these existing ones slower, by the added composition cost:

- PR20 (outside every step, so counted alone, together with every later check that reads its bound page: PR31, PR38, PR31d, PR33, PR34, PR47, PR48, PR50, PR21, PR23, PR24, PR24b, PR24c, PR24d, PR25, PR25b, PR21b, PR21e, PR21f, PR39);
- each re-bind in `e2e/suites/print-room/redraw.ts`;
- R3 in `e2e/suites/render.ts`, which composes twice;
- B3 in `e2e/suites/fallback.ts`, which composes inline.

**What PR20's unit holds:** far more than two claims held nowhere else, read on one room. So it is not thin, and the slow-step rule cannot find it too slow. One CI run's reading is owed, as **Evidence** says.

**No reading is staged.** No check is added, so this plan takes no fixture or mutation reading of one.

## Order of commits

1. Copy this plan, exactly as it stands after the rulings, to `handbook/plans/400/450/450-plan.md`. Add T1 and T2 to `test/atlas/compose.test.ts`. Run `npm test -- test/atlas/compose.test.ts`: both red, T1 on its digest and T2 on `assert.ok(parsed, ...)`. Commit and push.
2. Implement `src/atlas/compose.ts` as **Files** says. T1 and T2 go green. Commit.
3. Re-point the five test files and `scripts/region-detail/probes.ts` as **Files** says. Commit.
4. Edit `handbook/specs/region-and-voyage.md`, `handbook/specs/chart-dress.md`, and the comment at `src/world/region.ts` line 28. Commit.

## Rosters and doctrine

No new file, so no roster gains an entry. These lines are contradicted by the change and are replaced, as **Files** writes them out:

- the bullet at lines 142 to 144 of `handbook/specs/region-and-voyage.md`;
- the sentence at line 147 of `handbook/specs/chart-dress.md`;
- the doc comment at line 28 of `src/world/region.ts`;
- the test name and the messages in `test/world/detail-chain.test.ts`;
- the arm label in `scripts/region-detail/probes.ts`.

These are left alone on purpose:

- **`MEASURED_SECONDS` in `test/e2e/lane-timings.test.ts`.** "No pull request re-times a suite" (`handbook/specs/site-architecture.md`).
- **`README.md`'s "Regional zoom" paragraph.** It stays true.
- **`test/world/region-major-rivers.test.ts`'s "seed 27, the 0.38 window".** It never claimed to be the atlas.

## Evidence

Run each command on its own, and record its exit status.

- **The type check, lint and format:** `npm run check`, `npm run lint` and `npm run format:check`.
- **The new tests and the re-pointed fixtures:**
  - `npm test -- test/atlas/compose.test.ts`
  - `npm test -- test/render/close-up-names.test.ts`
  - `npm test -- test/world/region-roads.test.ts`
  - `npm test -- test/world/realm-carry.test.ts`
  - `npm test -- test/render/glyph-density.test.ts`
  - `npm test -- test/world/detail-chain.test.ts`
- **Nothing committed moves:**
  - `npm test -- test/world/golden-seed42.test.ts`
  - `npm test -- test/site/hero-charts.test.ts`
  - `npm test -- test/render/recipe-meta.test.ts`
  - `npm test -- test/site/print-room-contents.test.ts`
  - `npm test -- test/cli/atlas.test.ts`
  - `npm test -- test/site/region-detail-wiring.test.ts`
- **The full unit suite:** `npm test`, then `npm run astro:generate`. Report its seconds against main's. About 29 compositions in the unit suite grow by about 0.77 s each, so expect about 22 s more CPU on the Mac, spread across the shards.
- **The e2e suites the change touches, never the full local lanes:** run `npm run build`, then `VELLUM_E2E_SUITES=render,fallback,hunt,print-room npm run test:e2e`. `hunt` is print-room's `NEEDS_PREDECESSOR`.
- **The pull request's own CI run, lane A.** From its log, read and report three things against main's run 41793908846 (job 126453387802):
  - PR20a's and PR20's timestamps: main 5.1 s.
  - The print-room line under `per-suite wall clock`: main 102.2 s.
  - Lane A's total: main 541.0 s, against lane B's 572.4 s, the slowest.
- **`vellum-plate-reader` is owed at step 11.** Owed because the deliverable is an appearance and the ruling was made from a spike's stills.
  - **What it reads:** the hero atlas's two built plates, `generated/atlas/region-1.svg` and `generated/atlas/region-2.svg`, written by `npm run astro:generate`.
  - **What it measures:** what the spike's read measured, each counted the same way:
    - the cartouche title;
    - labels drawn against settlements;
    - whether the anchor is lettered;
    - the vertex count of `#layer-land`'s path;
    - the anchor mark's width;
    - clipped labels, and labels overlapping each other or the furniture.
  - **What it compares against:** the spike's two d rows, taken on 7200fdbb.

    | plate | title | labels | anchor lettered | coast vertices | anchor mark width | clipped, overlaps, furniture |
    |---|---|---|---|---|---|---|
    | region-1 | The Environs of Laukuwelua | 6/6 | yes | 7055 | 32.7 px | none |
    | region-2 | The Environs of Toatauhe | 3/3 | yes | 3976 | 22.3 px | none |

  - **A difference from these rows is a finding,** reported with the plate reader's own numbers.
- **The step 12 comment** names the framing ruling as provisional until the post-use review (`handbook/specs/conventions.md`, "Feel decisions are provisional"). The PR body says the same.

## Calls made

Each was taken without a ruling, on the rule named.

1. **One chain cache per composition, shared by its two plates; never the site's `regionChainCache`.** The rule is "Hold ONE chain cache across region jobs" (`handbook/specs/region-and-voyage.md`), read at the composition's own scope, plus the engine boundary. It saves about 0.15 to 0.2 s for the pair (1627 to 1680 ms alone, 1460 to 1493 ms shared).
2. **The plate's grid is its band's, 320 by 240, not the world recipe's.** Only then is the plate the Glass's sheet cell for cell, and `dispatchRegion` in `src/site/explorer/lod-controller.ts` sends the band's grid. No surface builds an atlas from a world of another grid.
3. **The plate's caption (the contents list and the figure caption) is the same derived title as its cartouche.** The rule is the one the bound atlas already keeps: one title per plate, in `AtlasPlate.title`.
4. **The anchors stay the capital and the town farthest from it.** The issue asks only about the window and the stamp.
5. **Every test fixture named for the atlas plate draws it from the atlas's own spec,** so it cannot drift from the atlas again. The rule is "Doctrine and rosters move with the code" (`handbook/specs/development-workflow.md` step 8). The off-lattice chain test keeps its 0.38 window, renamed for what it covers.
6. **No new browser check.** The rule is `handbook/specs/check-placement.md`, The unit suite.
7. **No change to `src/site/explorer/worker.ts` or `src/site/explorer/worker-client.ts`.** Both compose through `composeAtlas`, and R3 holds them equal.
8. **`src/world/region.ts` takes only its line-28 comment, because Issue #421's lane owns the file.** The comment would otherwise say the plates are bare, and the comment rule forbids leaving a false line.
9. **The probe arm in `scripts/region-detail/probes.ts` is renamed, not re-pointed.** Under this design it would duplicate band 2's sweep. Its 0.38 window still measures an off-lattice window.
10. **`MEASURED_SECONDS` is not edited.** The rule is `handbook/specs/site-architecture.md`, "No pull request re-times a suite".
11. **One pull request.**
12. **Names lying on a corner panel are not touched by this build.** The sweep above finds them on 5 of 80 second-close-up plates. Every one is the kind Issue #1105 ruled for every close-up, and none strays from a mark outside its panel. The coordinator files the first close-up's two cases outside this issue. The rule is `handbook/specs/development-workflow.md` step 15: a finding a pull request found but did not cause goes to an issue, not into the pull request. Here the behaviour is also ruled, and the issue does not name it. So at step 11, a name on a panel whose own mark stands under that panel, or a realm name lying whole on a panel, is not a finding against this pull request.

## Open decisions

none

All three menu items are ruled; **Rulings**, at the top, quotes them. Ruling 3 retires the sentence in `handbook/specs/chart-dress.md` line 147 that came from Issue #1104's plan call 5; **Files** writes out its replacement.

## Stop conditions

Hand back on any of these, rather than adapt:

- **A named file has moved.** `git diff --stat 7200fdbbd08acb38993d1d283e98dc4afeb9ccd5 origin/main -- src/atlas/compose.ts src/world/region.ts src/world/lod.ts src/world/detail-chain.ts test/atlas/compose.test.ts test/render/close-up-names.test.ts test/world/region-roads.test.ts test/world/realm-carry.test.ts test/render/glyph-density.test.ts test/world/detail-chain.test.ts scripts/region-detail/probes.ts` prints anything.
  - `src/world/region.ts` is the likeliest to have moved, since Issue #421's lane owns it.
  - `src/site/explorer/worker.ts` and `src/site/explorer/worker-client.ts` are read and never edited, so a change there is not a hand-back by itself. T1 going red after commit 2 is what says the Glass's region job moved.
- **T1 or T2 is green in commit 1,** or red on any assertion but the one named.
- **T1's digest differs after commit 2.** That means the plate is not the Glass's sheet. Do not adapt the job or the render options to make it equal.
- **T2's premise fails:** seed 2's far town, Nydstagrad, and its derived title agree.
- **A re-pointed fixture reds,** in close-up-names, region-roads, realm-carry, glyph-density or detail-chain. The planner measured all of them green at 7200fdbb.
- **A test outside the Files list reds** on the plates' titles, bytes, windows or count.
- **PR20 times out on CI,** or the pull request's CI run reads more than 12 s from PR20a to PR20. The poll budget is at least 15 s, main reads 5.1 s, and about 7 s is predicted.
- **The pull request's lane A total exceeds lane B's** on the same run. The lanes would then need re-sharing, which is not this issue's call.
