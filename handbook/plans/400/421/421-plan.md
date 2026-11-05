# Plan: Issue #421, the beast follows the Glass

A region sheet carries the parent world's sea beast when the Glass's window holds its haunt. It draws the beast at the world chart's size, and only near the haunt: a close-up with no room within the near reach shows no beast and keeps its decor serpent. One pull request.

**Planned at:** origin/main `7200fdbbd08acb38993d1d283e98dc4afeb9ccd5`, with Issue #421 at 1 comment, the rulings comment below (`gh api repos/ahl-gram/Vellum/issues/421/comments | jq length`).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/421#issuecomment-6645789110 (Alex, 2026-11-04).

- **Question 1, B:** "yes, same size as the world chart, with name and title".
- **Question 2, B:** "Only near home, else no beast". The beast is searched for only within the 460 px reach the world chart tries first; otherwise that close-up shows no beast and keeps its plain serpent.

## Specs

Read these, at these sections, before building, on top of what `CLAUDE.md`'s spec table owes:

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail":
  - the PARENT world is the authority;
  - `region.seaGate` gates ALL region sea-furniture;
  - a region-only change leaves the world sheets byte-identical.
- `handbook/specs/chart-dress.md`, "A sea beast is drawn last and yields to everything".
- `handbook/specs/engine-invariants.md`, "Identity versus view":
  - generating a thing is not the same as stamping it;
  - a view option is byte-identical when off;
  - a view option may still change other drawing;
  - the evidence that a view option leaves a chart alone.
- `handbook/specs/rulebook.md`, "Golden and committed-chart discipline", the lever "A render gate that only region sheets pass".
- `handbook/specs/check-placement.md`, "The unit suite": a unit test asserts what the code does, and a test may read a generated chart as data.
- `handbook/specs/conventions.md`:
  - "How a spec, and the rest of the house's prose, is written";
  - "How code is cited";
  - "Feel decisions are provisional".

## The design

**1. The carry, in `src/world/region.ts`.** A new private function, placed directly after `regionLakes`:

```ts
function regionBeasts(g: RegionGrid): World["beasts"]
```

For each beast in `world.beasts` (zero or one today):

- `u = beast.x / (recipe.gridW - 1)` and `v = beast.y / (recipe.gridH - 1)`, the same projection `regionLakes` and `projectSettlements` use.
- Drop the beast when `u < window.u0 || u > window.u1 || v < window.v0 || v > window.v1`. That is exactly `regionLakes`'s closed test, with no inset, so a haunt on the window's edge is carried.
- Otherwise return `{ ...beast, x: Math.round(((u - window.u0) / du) * (gridW - 1)), y: Math.round(((v - window.v0) / dv) * (gridH - 1)) }`, where `du = window.u1 - window.u0` and `dv = window.v1 - window.v0`.
- Every other field passes through unchanged: `kind`, `name`, `epithet`, `firstSeen` and `tale`. The coordinates are integers because `beastsLayer` indexes `world.oceanDist` with them.

Return the list with `flatMap`. In `generateRegionWorld`, the line `beasts: [],` becomes `beasts: regionBeasts(g),`. Nothing else in the file changes. `regionBeasts` is not exported; the tests reach it through `generateRegionWorld`.

**2. The gate, in `openBeastWater` in `src/render/layers/beasts.ts`.**

- Add `const gate = world.region?.seaGate;` after `const { w, h } = world.elev;`.
- Add `if (gate && gate[gx + gy * w] === 0) continue;` directly after `if (d < 8) continue;`.

It makes the same test as `openSeaSpots` in `src/render/layers/sea-decor.ts`, and it is inert on a world sheet, where `world.region` is undefined.

**3. The near reach, in `beastCandidates` in `src/render/layers/beasts.ts`** (ruling 2B). Today's two closing lines:

```ts
  const near = [home, ...viable.filter((o) => fromHome(o) < 460 * k)].slice(0, 140);
  return { near, viable };
```

become:

```ts
  const withinReach = viable.filter((o) => fromHome(o) < 460 * k);
  const near = [home, ...withinReach].slice(0, 140);
  return { near, viable: world.region === undefined ? viable : withinReach };
```

`placeBeast` and `firstBeastFit` do not change, and the walk keeps its order.

- A world sheet tries `near`, the haunt and then the 140 nearest open spots within `460 * k` px. Failing that, it tries every viable spot on the sheet, nearest first, exactly as today.
- A close-up tries the same `near`, then every viable spot within `460 * k` px of the haunt, nearest first, and nothing further.
- A close-up with no fit in that reach draws no beast, so `beastsLayer` returns null and the decor serpent keeps its place.
- `tryClaimAll` in `src/render/context.ts` claims nothing when it refuses, so such a close-up is byte-identical to one carrying no beast (T9, and the acceptance sweep's "as before").

The reach is every spot within 460 px, not the 140-spot first pass alone. This is Call 10, and why it matters is under the readings (R5).

**4. The yield needs no change.** In `labelledLayers` (`src/render/map-renderer.ts`), the decor serpent stands down on `bestiary === null`, which is the layer actually drawing.

**5. The survey address's comment.** `src/site/shared/table-address.ts` carries, above the `Field<T>` comment, the line:

```
// `beasts` rides though Issue #519 lists a four-field dress: it cannot change a survey today (`generateRegionWorld` sets `beasts: []`, measured byte-identical either way), and is encoded for the reason Issue #519 gives for encoding the style while the redraft is antique-only.
```

It is now false. Replace it with:

```
// `beasts` rides though Issue #519 lists a four-field dress, because a survey whose window holds the world's beast haunt draws that beast when the seal is set (Issue #421).
```

### Alternatives rejected, so none is rediscovered mid-build

- **Re-conjure a bestiary on the region.** The issue forbids it: the world's one beast stays one beast.
- **Carry only inside a 2% inset, as `projectSettlements` does.** An inset would blank windows whose haunt is inside them. Under the near reach, the hand-built edge windows still draw the beast (R4).
- **Snap the haunt to water, or refuse a home off the gate.** The mapped home was water with gate 1 in 600 of 600 windows (R1), so either check is code no fixture reaches.
- **Scale the thresholds or the reach by window size.**
  - Every Glass band (`LOD_BANDS` in `src/world/lod.ts`) and the atlas's regional plates (`regionPlates` in `src/atlas/compose.ts`) draw a 320 by 240 grid over the same 1500 px width. So a cell, and 460 px, are the same distance on the sheet at every depth.
  - Scaling by depth in world units would ask for `8 / sizeUV` cells of open sea, 256 at band 5.
- **Gate the glyph's and label's boxes in `overWater` as well as the candidate spot.** The sea decor gates the spot alone.
- **The whole-sheet walk on a close-up.** This was menu option 2A; Alex ruled 2B.
- **The 140-spot first pass alone as the close-up's reach**, `[near]` without the reach's remainder. Ruling 2B names a 460 px reach, and that pass stops well short of it on open sea (R5).
- **A beast grown with the survey's depth.** This was menu option 1C; Alex ruled 1B.
- **A browser check.**
  - `runInline` (`src/site/explorer/worker-client.ts`) runs the Glass's own region job in Node.
  - The worker's region spec is held by e2e R14, and its cache by a kept read in `test/site/region-detail-wiring.test.ts`.
  - So the cheapest instrument that sees it all is the unit suite.

## Files

- `src/world/region.ts`, edited, 339 lines growing to about 353:
  - adds `regionBeasts(g: RegionGrid): World["beasts"]`, about 14 lines;
  - edits the one `beasts:` line in `generateRegionWorld`.
- `src/render/layers/beasts.ts`, edited, 192 lines growing to 195:
  - the two gate lines in `openBeastWater`;
  - the three lines in `beastCandidates` above.
- `src/site/shared/table-address.ts`, edited: the one comment line, and no other line.
- `test-support/beast-spot.ts`, created, about 15 lines. It exports `beastSpot(svg: string, kind: BeastKind): { readonly x: number; readonly y: number } | null`:
  1. Take the first `id="beast-0"` group of a 1500-wide sheet, sliced to its `</g>`; the group holds no nested group.
  2. Match its label `/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/`.
  3. Return `{ x: Number(x), y: Number(y) - beastExtents(kind, 1).down - 15 }`, the waterline spot `beastNode` in `src/render/layers/beasts.ts` labels. Return null when there is no group or no label.
  4. Import `beastExtents` from `src/render/layers/beast-glyphs.ts` and type `BeastKind` from `src/society/bestiary.ts`.

  One contract line above it: `// The waterline spot \`beastNode\` in \`src/render/layers/beasts.ts\` labels, read back from a 1500-wide sheet; null when no beast or no label was drawn.`
- `test/world/region-beasts.test.ts`, created: T1 and T2.
- `test/render/region-beasts.test.ts`, created: T3, T4, T5 and T9.
- `test/site/region-detail-wiring.test.ts`, edited, 153 lines growing to about 175: T6 appended at the foot.
- `test/society/bestiary.test.ts`, edited, 136 lines growing to about 150: T7 appended at the foot.
- `test/render/region-sea-furniture.test.ts`, edited, 183 lines growing to about 205: T8 appended at the foot.
- `handbook/specs/region-and-voyage.md` and `handbook/specs/chart-dress.md`, edited, with the wording under Rosters.
- `handbook/plans/400/421/421-plan.md`, created: this plan, copied unchanged.

No file is deleted. No file passes 400 lines, and no function passes 50.

## Tests, in the order they are written

All nine are unit tests (`npm test -- <file>`). None reads a source file, so `test-support/source-read-list.ts` gains nothing.

The guard prover owes all nine, each with the mutations named. Step 15 leaves to the implementer only a guard changed after the prover's round.

None needs a stub: each goes through `generateRegionWorld`, `renderMap`, `beastsLayer` or `runInline`, which all exist on main. Each red is named; the two preservation guards, T3 and T7, are green on main and proved by mutation alone. Say so in the PR body.

Shared definitions:

- `const OFF = { style: "antique", widthPx: 1500, legend: true } as const` and `const ON = { ...OFF, beasts: true } as const`.
- A `digest` helper copied from `test/site/region-detail-wiring.test.ts` (sha256 prefix plus length), wherever two sheets are compared.
- `proj = createProjection(320, 240, 1500, marginFor(1500))` from `src/render/transform.ts`, wherever a spot is set against a cell or a haunt.

### `test/world/region-beasts.test.ts` (new)

Module scope:

```ts
const world = generateWorld(defaultRecipe(42));
const beast = world.beasts[0]!;
const u = beast.x / (world.recipe.gridW - 1);
const v = beast.y / (world.recipe.gridH - 1);
const regionOf = (window: UvWindow) => generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "A Survey" });
```

Imports:

- `defaultRecipe` and `generateWorld` from `src/world/generate.ts`;
- `generateRegionWorld` from `src/world/region.ts`;
- `LOD_BANDS`, `lodWindowFor` and `quantizeCenter` from `src/world/lod.ts`;
- type `UvWindow` from `src/terrain/heightfield.ts`.

**T1.** `test("a close-up whose window holds the haunt carries the parent's beast, whole, on the window's own grid (seed 42, band 2)", ...)`

- Fixture: `const band = LOD_BANDS[2]!; const q = quantizeCenter(u, v, band.sizeUV); const window = lodWindowFor(q.cx, q.cy, band.sizeUV);`. This is `{ u0: 0.6875, v0: 0.74, u1: 0.9375, v1: 0.99 }`.
- Assertions, in order:
  1. The premise `world.beasts.length === 1`, "fixture drift: seed 42 no longer conjures its beast".
  2. `region.beasts.length === 1`.
  3. With `const { x, y, ...carried } = region.beasts[0]!` and `const { x: _x, y: _y, ...parent } = beast`, `assert.deepEqual(carried, parent)`.
  4. `Number.isInteger(x) && Number.isInteger(y)`.
  5. `Math.abs(window.u0 + (x / 319) * (window.u1 - window.u0) - u) <= (window.u1 - window.u0) / (2 * 319)`, and the same for v with 239 and the window's height.
- Readings on the spike: carried 1 at (155, 125); identity equal; |du| 0.000196 against 0.000392; |dv| 0.000460 against 0.000523.
- Red on main: length 0.
- Mutations that must red it:
  - (m1) `[beast]` unmapped;
  - (m2) y mapped with `gridW - 1`;
  - (m3) `Math.round` dropped from x.

**T2.** `test("a close-up carries the beast exactly when the haunt lies inside its window, its edge included", ...)`

Three fixtures, each `regionOf(window)`:

| window | u0 | u1 | v0 | v1 | haunt's place across the width | carried |
|---|---|---|---|---|---|---|
| `miss` | u - 0.252 | u - 0.002 | 0.7 | 0.95 | 1.008 | none |
| `hold` | u - 0.248 | u + 0.002 | 0.7 | 0.95 | 0.992 | one, at (316, 163) |
| `far` | from `lodWindowFor(0.25, 0.25, 0.25)` | | | | 2.735 | none |

- Assert, with those readings: `miss` and `far` carry no beast; `hold` carries one.
- Red on main: `hold` gives 0.
- Mutations that must red it:
  - (m4) the window test dropped: `miss` and `far` red;
  - (m5) the settlements' 2% inset added: `hold` reds.

### `test/render/region-beasts.test.ts` (new)

Imports:

- `createHash` from `node:crypto`;
- `defaultRecipe` and `generateWorld` from `src/world/generate.ts`;
- `generateRegionWorld` and `regionTitle` from `src/world/region.ts`;
- `LOD_BANDS`, `lodWindowFor` and `quantizeCenter` from `src/world/lod.ts`;
- `renderMap` from `src/render/map-renderer.ts`;
- `createProjection` and `marginFor` from `src/render/transform.ts`;
- `beastSpot` from `test-support/beast-spot.ts`.

Module scope:

- `const world42 = generateWorld(defaultRecipe(42))` and its `beast`.
- `const closeUp2`: T1's band 2 window, built through `generateRegionWorld(world42, { window, gridW: 320, gridH: 240, title: regionTitle(world42, window), detail: true })`, the Glass's detailed ground.

**T3.** `test("with the beasts seal off, a close-up carrying a beast draws exactly what one carrying none draws", ...)`

- Assert `digest(renderMap(closeUp2, OFF)) === digest(renderMap({ ...closeUp2, beasts: [] }, OFF))`.
- Witnesses:
  - `closeUp2.beasts.length === 1`;
  - `renderMap(closeUp2, OFF)` includes `id="sea-serpent"`, "fixture drift: no decor serpent for a leak to remove".
- Readings: identical true; serpent present.
- Mutations that must red it:
  - (m6) `{ serpent: bestiary === null }` in `labelledLayers` in `src/render/map-renderer.ts` becomes `{ serpent: ctx.world.beasts.length === 0 }`;
  - (m7) the `opts.beasts ?` guard dropped from the `bestiary` line there.

**T4.** `test("a carried beast is drawn on the close-up, and the decor serpent stands down for it (seed 42, band 2)", ...)`

- `const svg = renderMap(closeUp2, ON)`. Assert:
  - `svg.includes('id="layer-bestiary"')`;
  - `svg.includes(`>${beast.name}, ${beast.epithet}<`)`;
  - `!svg.includes('id="sea-serpent"')`.
- Witness: `renderMap({ ...closeUp2, beasts: [] }, ON)` includes `id="sea-serpent"`.
- Readings: true; label "Rauhoahai, the Eater of Anchors"; serpent false; witness true.
- Red on main: no bestiary.
- Mutations that must red it:
  - (m8) `regionBeasts` returns `[]`;
  - (m9) `{ serpent: bestiary === null }` becomes `{}`.

**T5.** `test("a carried beast pushed off its haunt is drawn nudged within its near reach (seed 42, band 3, the haunt in the corner)", ...)`

- Fixture:
  - `const band = LOD_BANDS[3]!; const step = band.sizeUV / 8; const window = lodWindowFor(55 * step, 59 * step, band.sizeUV);`, which is `{ u0: 0.796875, v0: 0.859375, u1: 0.921875, v1: 0.984375 }`;
  - the region built detailed, as `closeUp2` is;
  - `const svg = renderMap(region, ON)`, with `const home = region.beasts[0]!` and `const spot = beastSpot(svg, home.kind)`.
- Assertions, in order:
  1. `svg.includes('id="beast-0"')`, "a beast with room near its haunt was lost";
  2. `spot !== null`;
  3. `Math.hypot(spot.x - proj.px(home.x), spot.y - proj.py(home.y))` is above 1, "fixture drift: the beast now fits at its haunt, so the search is never run";
  4. that distance is below 460, "the beast was drawn beyond the near reach".
- Readings: home (30, 21); drawn; label "Rauhoahai, the Eater of Anchors"; spot 104.8 px off.
- Red on main: not drawn, since nothing is carried. It is green from commit 2 on.
- Mutations that must red it:
  - (m11) `if (gate) continue;` in `openBeastWater`, which skips every cell of a close-up;
  - (m12) the close-up searches its haunt alone: `beastCandidates` returns `{ near: [home], viable: world.region === undefined ? viable : [] }`.

**T9.** Written after the gate, see Order of commits.

`test("a close-up with no room near the haunt draws no beast and stays exactly as it was (seed 22, band 1, the haunt under the title)", ...)`

- Fixture:
  - `const world22 = generateWorld(defaultRecipe(22)); const band = LOD_BANDS[1]!; const step = band.sizeUV / 8; const window = lodWindowFor(7 * step, 5 * step, band.sizeUV);`, which is `{ u0: 0.1875, v0: 0.0625, u1: 0.6875, v1: 0.5625 }`;
  - the region built detailed;
  - `const svg = renderMap(region, ON)`.
- Assertions, in order:
  1. `!svg.includes('id="beast-0"')`, "the close-up drew its beast beyond the near reach";
  2. `digest(svg) === digest(renderMap({ ...region, beasts: [] }, ON))`, "a close-up that finds no room near the haunt is not the sheet it was";
  3. `svg.includes('id="sea-serpent"')`, "the decor serpent did not keep its place".
- Witness: `region.beasts.length === 1`, "fixture drift: the window no longer carries the beast".
- Readings: carried, home (36, 30); not drawn; identical to the beast-less sheet; decor serpent and ship present.
- Red after commit 4, while the close-up still walks the whole sheet: drawn, 1088 px off, label "Farisaha, the Grey Titan".
- Mutation that must red it: (m13) `world.region === undefined ? viable : withinReach` back to `viable`.

### `test/site/region-detail-wiring.test.ts` (edited)

**T6.** `test("the Glass's region job over the beast's haunt draws the parent's beast when the seal is set (seed 2, band 2)", ...)`, appended at the foot.

- Fixture:
  - the file's `world` (seed 2), with `const beast = world.beasts[0]!` and `const band = LOD_BANDS[2]!`;
  - `const q = quantizeCenter(beast.x / (world.recipe.gridW - 1), beast.y / (world.recipe.gridH - 1), band.sizeUV)`, giving the window `{ u0: 0.15625, v0: 0.03125, u1: 0.40625, v1: 0.28125 }`;
  - `const job = { kind: "region" as const, seed: SEED, overrides: {}, window: lodWindowFor(q.cx, q.cy, band.sizeUV), gridW: band.gridW, gridH: band.gridH, band: band.index, render: { ...RENDER, beasts: true } }`.
- Assertions:
  - `runInline(job).svg` includes `id="layer-bestiary"` and `beast.name`;
  - `runInline({ ...job, render: RENDER }).svg` does not include `id="layer-bestiary"`.
- Readings: true; name "Zvyl" true; seal off false.
- Red on main: no bestiary.
- Mutations that must red it:
  - (m14) in `runInline`'s region branch in `src/site/explorer/worker-client.ts`, `renderMap(region, { ...msg.render, regionRecipe })` becomes `renderMap(region, { ...msg.render, beasts: false, regionRecipe })`;
  - (m8).

### `test/society/bestiary.test.ts` (edited)

**T7.** `test("a world sheet still searches its whole sheet for room when none is near the haunt (seed 31)", ...)`, appended at the foot.

- Fixture: `const w31 = generateWorld(defaultRecipe(31)); const svg = renderMap(w31, { style: "antique", legend: true, beasts: true }); const spot = beastSpot(svg, w31.beasts[0]!.kind);`. Import `beastSpot`, and `createProjection` and `marginFor`.
- Assertions:
  1. `svg.includes('id="beast-0"')`, "the world sheet lost a beast it used to carry across the sheet";
  2. `spot !== null`.
- Witness: the spot lies more than 460 px from `proj.px(haunt.x), proj.py(haunt.y)` on a `createProjection(w31.elev.w, w31.elev.h, 1500, marginFor(1500))`, "fixture drift: seed 31's beast now fits within its near reach, so this no longer holds the whole-sheet search".
- Reading: drawn, 765 px off its haunt.
- The planner swept seeds 1 to 300 for a world beast beyond the reach (`421-probe-world-reach.ts`), and seed 31 is the first with the legend both on and off. The existing seed 1234 test sits at 458 px, inside the reach, so it cannot see this.
- Green on main.
- Mutation that must red it: (m15) `return { near, viable: withinReach }`, the reach on every sheet.

### `test/render/region-sea-furniture.test.ts` (edited)

**T8.** Written after the carry and before the gate, see Order of commits.

`test("#421: a beast with no open sea near its haunt never inks the lake the close-up floods as sea (lake plate)", ...)`, appended at the foot. It uses the file's `world`, `lakePlate`, `ctxFor`, `planFurniture`, `collectPoints` and `assertNoneInLake`, and imports `beastsLayer` from `src/render/layers/beasts.ts`.

- Fixture:
  - `const home = { x: 4, y: 0 }`;
  - `const plate = { ...lakePlate, beasts: [{ ...world.beasts[0]!, ...home }] }`, a made-up home on the plate's genuine sea;
  - `const ctx = ctxFor(plate, "antique"); const { compass, cart } = planFurniture(ctx); const node = beastsLayer(ctx, cart, compass);`.
- Witnesses, first:
  - `lakePlate.region!.seaGate![home.x + home.y * lakePlate.elev.w] === 1`, "fixture drift: the home is no longer on the parent's sea";
  - at least one cell on the stride `openBeastWater` scans (gx and gy from 4, step 2, inside 4 of the border) has `lakePlate.oceanDist[i] >= 8`, `seaGate[i] === 0`, and lies within 460 px of `ctx.proj.px(home.x), ctx.proj.py(home.y)`, "fixture drift: no lake water open enough for an ungated search lies within the reach".
- Assertion: `assertNoneInLake(lakePlate, collectPoints(node), "beast")`.
- Readings:
  - home on gate 1;
  - 975 open lake cells within the reach;
  - gated, the beast is not drawn and inks nothing;
  - with the gate line deleted, it is drawn with 10 ink points deep in the lake.
- Red, after commit 2 and before commit 4: 10 points in the lake.
  - This red is inferred, not read at that commit. The 10 points were read with the gate switched off on the planned code, whose walk keeps the whole-sheet walk's first list, so the commit 3 tree draws the same spot.
  - The stop condition on a wrong red catches it if not.
- Mutations that must red it:
  - (m10) the gate line deleted;
  - (m16) the gate inverted, `gate[gx + gy * w] === 1`.

**The positive witness T8 lacks, named.** No fixture was found where the gate moves a beast off a lake onto the parent's sea within the near reach: one that is drawn on the sea when gated and inks a lake when not.

- Across 5 lake-rich close-ups, 22 of 6565 made-up homes on genuine sea made an ungated beast ink a lake. In all 22, the gated beast had no open sea within reach and was not drawn (`421-probe-lake-near.ts`).
- Across every lattice window of bands 1 to 4 holding a real haunt of seeds 1 to 20, 5855 windows, the gate never changed the outcome (R3).
- So on this plate T8 passes because the beast is dropped, which ruling 2B makes the right outcome.
- What a positive witness would hold, that the gate does not swallow every candidate, is held instead by T5: mutation (m11) loses T5's nudged beast.

## Order of commits

Each subject starts `#421`, and each message ends with the three-line trailer block `CLAUDE.md` gives.

1. `#421 The plan and the failing tests: a close-up carries its parent's sea beast`
   - The plan, `test-support/beast-spot.ts`, T1 to T7.
   - Red: T1, T2's `hold`, T4, T5, T6.
   - Green: T2's `miss` and `far`, T3, T7.
   - Push here.
2. `#421 A close-up carries the parent's sea beast when its window holds the haunt`
   - `src/world/region.ts`.
   - T1, T2, T4, T5 and T6 go green.
3. `#421 The failing test: a beast with no open sea near its haunt must not ink a parent lake`
   - T8. Red: 10 points in the lake.
4. `#421 The beast's search for open water skips water the parent charts as lake`
   - The gate lines.
   - T8 goes green.
5. `#421 The failing test: a close-up with no room near the haunt draws no beast`
   - T9. Red: drawn 1088 px off.
6. `#421 A close-up searches for its beast only within the near reach`
   - The `beastCandidates` lines.
   - T9 goes green.
7. `#421 The doctrine and the survey address follow the carried beast`
   - `handbook/specs/region-and-voyage.md`, `handbook/specs/chart-dress.md` and `src/site/shared/table-address.ts`.

## Rosters and doctrine

**`handbook/specs/region-and-voyage.md`, first edit.** The bullet that today reads:

```
- **`region.seaGate` gates ALL region sea-furniture**, not the caption alone: the compass sea search,
  the sea decor, the currents, the winds, the soundings and the feature labels each skip a gated
  cell. It is absent on a world sheet, so the gate is inert there.
```

becomes:

```
- **`region.seaGate` gates ALL region sea-furniture**, not the caption alone: the compass sea search,
  the sea decor, the sea beast's search for open water, the currents, the winds, the soundings and
  the feature labels each skip a gated cell. It is absent on a world sheet, so the gate is inert
  there.
```

**`handbook/specs/region-and-voyage.md`, second edit.** Insert this bullet directly after the bullet opening "**Realms are CARRIED onto a region sheet**", which ends "copy per style.", and before the bullet opening "**Borders are not stroked from the tint rings.**":

```
- **Carry the parent's sea beast onto a close-up, and never conjure one there.** Where the window
  holds the haunt, its edge included, the region world takes the parent's beast whole (its kind,
  name, epithet, first sighting and tale) with the haunt projected through the window onto the
  nearest cell of the close-up's grid; a window that misses the haunt carries none
  (`regionBeasts` in `src/world/region.ts`). Draw it with the world sheet's own layer, at the
  world sheet's size, but search only within 460 px of the haunt on a 1500 px sheet, every viable
  spot in that reach and none beyond it; a close-up with no room there draws no beast and keeps
  its decor serpent, where a world sheet goes on to search its whole sheet (`beastCandidates` in
  `src/render/layers/beasts.ts`). Every band draws the same grid over the same width, so the
  layer's clearances, counted in the close-up's own cells, and the reach are the world sheet's on
  the sheet, and are never scaled by depth. With the seal off, or with no beast drawn, a close-up
  draws exactly what it drew without one. **Provisional until the post-use review**
  (Issue #421): the beast at the world sheet's size on every band, and the near reach.
```

**`handbook/specs/chart-dress.md`.** The last three lines of the paragraph opening "**A sea beast is drawn last and yields to everything.**", which today read:

```
glyph alone. It searches near its haunt first and then the whole sheet before it drops, so a legend
drawn over the haunt moves the beast rather than losing it. What a beast is, and what it does to the
anonymous sea decor, is `handbook/specs/engine-invariants.md`'s.
```

become:

```
glyph alone. On a world sheet it searches near its haunt first and then the whole sheet before it
drops, so a legend drawn over the haunt moves the beast rather than losing it; a close-up searches
only near the haunt, and what it carries is `handbook/specs/region-and-voyage.md`'s. What a beast
is, and what it does to the anonymous sea decor, is `handbook/specs/engine-invariants.md`'s.
```

**`src/site/shared/table-address.ts`.** The comment, as given under The design.

**What else was checked, and does not change:**

- `CLAUDE.md`: no change.
- `test-support/source-read-list.ts`: no new read.
- `handbook/specs/engine-invariants.md`: "a consumer checks rather than assumes" an empty `beasts` still holds.
- `test/repo/prose-paths.test.ts`: every backticked path in the new spec text exists.
- `vellum/ts-comment-issue-form` and `vellum/ts-comment-citation-resolves`: the new comments name "Issue" with each number and cite `beastNode` in a file that holds it.

No e2e roster, nav, page or bundle is joined.

## Evidence

Run each command alone, and name each in the PR body as run locally. CI runs the full suite and every e2e lane.

- `npm run check`, `npm run lint` and `npm run format:check`. Run `npm run format` first if the last complains.
- The new and edited tests: `npm test -- test/world/region-beasts.test.ts test/render/region-beasts.test.ts test/site/region-detail-wiring.test.ts test/society/bestiary.test.ts test/render/region-sea-furniture.test.ts`.
- **No regen owed, by command:** `npm test -- test/site/hero-charts.test.ts test/world/golden-seed42.test.ts test/world/region.test.ts`.
  - The planner ran the drift guard, the golden, the bestiary, region sea furniture, region-detail wiring and the region tests on the planned code, once no other suite was running: 46 of 46 green.
  - No committed chart, og card or golden reads a region world, and the regional atlas plates render with the seal off (`regionPlates` in `src/atlas/compose.ts`).
- The full unit suite: `npm test`, then `npm run astro:generate`.
- **The acceptance sweep, pasted into a PR comment with the probe text and the five tallies.**
  - Write the probe below to `out/421-dry-run/421-probe-accept.ts` in your tree.
  - Run it once per band, one run at a time: `node out/421-dry-run/421-probe-accept.ts 1 20 <band> 2>/dev/null > out/421-dry-run/421-probe-accept-b<band>.log`, for bands 1 to 5. Each covers every Glass lattice window of that band holding seeds 1 to 20's haunts.
  - Each run takes many minutes: the planner's took 10 to 18 minutes per band, run beside ten other jobs on 16 cores.
  - Its log is silent until the end, except for a `lacking:` line per close-up without a beast, which only bands 1 and 2 print. A log unmoved for ten minutes is expected here, so let each run finish.
  - Its tallies must equal the planner's exactly, since the build is the planned code: the five `TALLY` lines, which the planner read as:

    ```
    TALLY band 1: windows 1203 at its haunt 419 nudged 735 (furthest 456 px) lacking 49 (4.1%, as before 49) drawn off the gate 0 serpent 687 before 30 now ship 441 before 634 now
    TALLY band 2: windows 1780 at its haunt 1112 nudged 660 (furthest 451 px) lacking 8 (0.4%, as before 8) drawn off the gate 0 serpent 1084 before 6 now ship 991 before 961 now
    TALLY band 3: windows 1592 at its haunt 785 nudged 807 (furthest 458 px) lacking 0 (0.0%, as before 0) drawn off the gate 0 serpent 364 before 0 now ship 347 before 287 now
    TALLY band 4: windows 1280 at its haunt 715 nudged 565 (furthest 460 px) lacking 0 (0.0%, as before 0) drawn off the gate 0 serpent 4 before 0 now ship 4 before 3 now
    TALLY band 5: windows 1280 at its haunt 714 nudged 566 (furthest 458 px) lacking 0 (0.0%, as before 0) drawn off the gate 0 serpent 0 before 0 now ship 0 before 0 now
    ```

    That is 7135 close-ups holding a haunt. 57 lack the beast, every one byte-identical to the close-up with no beast. None is drawn off the parent's sea, and none farther than 460 px from its haunt.
  - Depth 1's lacking share checks the menu's estimate of "about 4 in 100" (49 of 1203, 4.1%).
- **e2e: no suite is touched.**
  - `git grep -n "beasts=1" -- e2e` finds only the Print Room's proof, a world sheet.
  - `R15b` in `e2e/suites/render.ts` is a world sheet. Every close-up an e2e suite opens carries `beasts=0`.
  - Run no e2e suite locally.
- **`vellum-plate-reader` is owed at step 11**, the deliverable being an appearance ruled from stills.
  - Have it open `/explorer/#seed=42&style=antique&legend=1&arms=0&beasts=1&cx=0.7842&cy=0.8310&k=4` on the built site.
  - Before measuring, it confirms the committed inset's `data-vellum-region-u0`, `-v0`, `-u1` and `-v1` read `0.6875`, `0.74`, `0.9375` and `0.99`. The planner computed the address by `decideSettle` and `plotUvFromSheet` in `src/world/lod.ts` with `marginFor(1500)`, not from the page.
  - It then measures that `#map .region-inset svg` carries `#beast-0` with its full label, clear of every other text box and of land, and no `#sea-serpent`.
  - It compares that with the ruled still `421-seed42-band2-centred-b-carried.png`.

The acceptance probe (text to write verbatim):

```ts
// Issue #421 acceptance sweep: for every Glass lattice window of the given bands that holds a seed's beast haunt, render the close-up with the beasts seal on as built and as it was before the carry (its beast taken away), and tally per band how many draw the beast at its haunt, how many nudged within the near reach, how many lack it, whether a lacking close-up is byte-identical to the one drawn before the carry, and what happened to the decor serpent and ship.
// Run from the tree root, one band per run: node out/421-dry-run/421-probe-accept.ts <firstSeed> <lastSeed> <band>
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import { LOD_BANDS, lodWindowFor } from "../../src/world/lod.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { beastExtents } from "../../src/render/layers/beast-glyphs.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import type { SeaBeast } from "../../src/society/bestiary.ts";

const DASH: Record<SeaBeast["kind"], number> = { serpent: 2.0 * 0.85, whale: 2.1 * 0.9, kraken: 2.3 * 0.8 };

function spotOf(svg: string, kind: SeaBeast["kind"]): { x: number; y: number } | null {
  const at = svg.indexOf('id="beast-0"');
  if (at < 0) return null;
  const group = svg.slice(at, svg.indexOf("</g>", at));
  const t = /<text x="(-?[\d.]+)" y="(-?[\d.]+)"/.exec(group);
  if (t) return { x: Number(t[1]), y: Number(t[2]) - beastExtents(kind, 1).down - 15 };
  const dashes = [...group.matchAll(/<path d="M(-?[\d.]+) (-?[\d.]+)h/g)];
  const last = dashes[dashes.length - 1];
  if (!last) return null;
  return { x: Number(last[1]) + 40 * DASH[kind], y: Number(last[2]) - 4 * DASH[kind] };
}

const proj = createProjection(320, 240, 1500, marginFor(1500));
const ON = { style: "antique" as const, widthPx: 1500, legend: true, beasts: true };
const count = (svg: string, id: string): number => svg.split(`id="${id}"`).length - 1;
const first = Number(process.argv[2] ?? 1);
const last = Number(process.argv[3] ?? first);
const b = Number(process.argv[4] ?? 1);
const band = LOD_BANDS[b]!;
const step = band.sizeUV / 8;
const n = Math.round(1 / step);
const t = { windows: 0, atHome: 0, nudged: 0, furthest: 0, lacking: 0, lackingAsBefore: 0, offGate: 0, serpentBefore: 0, serpentNow: 0, shipBefore: 0, shipNow: 0 };
for (let seed = first; seed <= last; seed++) {
  const world = generateWorld(defaultRecipe(seed));
  const beast = world.beasts[0];
  if (!beast) continue;
  const u = beast.x / (world.recipe.gridW - 1);
  const v = beast.y / (world.recipe.gridH - 1);
  const cache = createChainCache(16);
  for (let lx = 0; lx <= n; lx++) {
    for (let ly = 0; ly <= n; ly++) {
      const win = lodWindowFor(lx * step, ly * step, band.sizeUV);
      if (u < win.u0 || u > win.u1 || v < win.v0 || v > win.v1) continue;
      const region = generateRegionWorld(world, { window: win, gridW: 320, gridH: 240, title: regionTitle(world, win), detail: true, chainCache: cache });
      const home = region.beasts[0];
      if (!home) {
        console.log(`NOT CARRIED seed ${seed} band ${b} lattice (${lx},${ly})`);
        continue;
      }
      const now = renderMap(region, ON);
      const before = renderMap({ ...region, beasts: [] }, ON);
      t.windows++;
      t.serpentBefore += count(before, "sea-serpent");
      t.serpentNow += count(now, "sea-serpent");
      t.shipBefore += count(before, "sea-ship");
      t.shipNow += count(now, "sea-ship");
      const spot = spotOf(now, home.kind);
      if (spot === null) {
        t.lacking++;
        if (now === before) t.lackingAsBefore++;
        console.log(`lacking: seed ${seed} band ${b} lattice (${lx},${ly}) home (${home.x},${home.y}) as before ${now === before}`);
        continue;
      }
      const moved = Math.hypot(spot.x - proj.px(home.x), spot.y - proj.py(home.y));
      if (moved < 1) t.atHome++;
      else t.nudged++;
      t.furthest = Math.max(t.furthest, moved);
      const gx = Math.round((spot.x - proj.margin) / proj.scale);
      const gy = Math.round((spot.y - proj.margin) / proj.scale);
      if (region.region?.seaGate?.[gx + gy * 320] !== 1) t.offGate++;
    }
  }
}
console.log(
  `TALLY band ${b}: windows ${t.windows} at its haunt ${t.atHome} nudged ${t.nudged} (furthest ${t.furthest.toFixed(0)} px) lacking ${t.lacking} (${((100 * t.lacking) / Math.max(1, t.windows)).toFixed(1)}%, as before ${t.lackingAsBefore}) drawn off the gate ${t.offGate} serpent ${t.serpentBefore} before ${t.serpentNow} now ship ${t.shipBefore} before ${t.shipNow} now`,
);
```

### The readings behind the design

Each reading comes from the planner's probes in `out/421-dry-run/` of its tree. They ran at `7200fdbb` plus the spike, which is the planned code with two throwaway switches (`globalThis.__421NoGate`, `globalThis.__421Grow`) that no planned file carries.

- **R1, the carried home.** `421-probe-carry.ts 1 60` covered 600 windows holding a haunt: seeds 1 to 60, bands 1 to 5, centred and three lattice steps off. The mapped home was water with gate 1 in 600. The carry does not depend on ruling 2B, so this stands.
- **R2, the stills.** `421-probe-stills-2b.ts` renders the four spike windows with the planned code.
  - The seed 42 band 2, band 3 and band 5 renders equal the ruled `-b-carried` stills byte for byte.
  - The seed 22 band 1 render equals that window's `-a-today` still byte for byte.
- **R3, the gate.** `421-probe-near.ts 1 20 <band>` covered every lattice window holding a haunt, rendered with and without the gate.
  - Under the reach as built, over bands 1 to 4 (5855 windows), the gate changed the outcome on 0 windows, and no ungated beast stood on a parent lake.
  - Under the first pass alone it was also 0, at every band.
  - The 2A sweep's walk over the whole sheet had found 8 windows where the gate mattered. The 4 of those measured were all beasts drawn more than 460 px off their haunt, which ruling 2B no longer allows.
- **R4, the window edge.** `421-probe-edge.ts 1 20` was re-run on the planned code. It uses hand-built windows with the haunt at 0, 0.5, 1 and 2% in from one edge and at 98, 99, 99.5 and 100% across, each axis in turn, with the other axis centred, at every band: 1144 windows (36, 172, 296, 320 and 320 by band). All were carried, and all were drawn within the 460 px reach.
- **R5, why the reach is every spot within 460 px.** Run under the first-pass-only reach (`[near]` on a close-up), the same lattice windows lack the beast more often than the ruling's 460 px allows: 57 at band 1 (4.7%), 14 at band 2 (0.8%), 19 at band 3 (1.2%), 6 at band 4 (0.5%) and 8 at band 5 (0.6%), against 49, 8, 0, 0 and 0 with the reach as built (`421-probe-near.ts`, run before the reach lines). The deep-band losses are haunts under the key in the sheet's bottom-right corner.
  - On open sea, `openBeastWater` puts a spot every 2 cells, about 9.4 px.
  - So the 140 nearest spots lie within roughly 60 px of the haunt, and a key or title box over the haunt leaves the beast no room though open sea lies 100 px away.
  - The reach as built gives the acceptance table above.

## Calls made

Copy these into the step 12 comment. Each is a decision the issue and the rulings did not rule, with the rule it was taken on. Calls 1 to 9 were relayed at the first STOP, and ruling 2B conflicts with none of them; Call 10 is new.

1. **No inset at the window's edge**, the lakes' closed test.
   - Rule: the issue's "carry it only when the haunt cell falls inside the window".
   - Measured under the near reach in R4.
2. **No sea snap or home gate on the carried haunt.**
   - Rule: no guard that no fixture reaches.
   - Measured: 600 of 600 homes on gated water (R1).
3. **No scaling of the thresholds or of the reach by depth.**
   - Rule: every band and plate draws a 320 by 240 grid over the same width, so a cell and 460 px are the same distance on the sheet at every depth.
4. **The gate covers the candidate scan alone, as the sea decor's does.**
   - Rule: `handbook/specs/region-and-voyage.md`, "`region.seaGate` gates ALL region sea-furniture", whose every member gates its spot.
5. **Unit tests only, with no browser check.** Rule: `handbook/specs/check-placement.md`, the cheapest instrument that can see the rule.
6. **The regional atlas plates stay beast-free.** They render with the seal off, and Issue #450's lane owns `src/atlas/compose.ts`.
7. **No new lore surface.** The label and hover title carry the lore, as on the world chart (`beastNode` in `src/render/layers/beasts.ts`).
8. **Issue #422 and this issue are ordered freely.**
   - They share no line, and no test here pins a close-up's ship.
   - Whichever lands second merges main and runs `test/society/bestiary.test.ts`, `test/render/region-sea-furniture.test.ts` and this issue's tests.
   - If Issue #422 lands first, the sweep's ship counts move, and that is not a hand-back.
   - If its build moves the beast's walk out of `src/render/layers/beasts.ts`, the second to land carries the gate lines and the reach lines with it.
9. **The table-address comment is rewritten, not deleted.** It now gives the true reason `beasts` is encoded.
10. **The close-up's reach is every viable spot within 460 px of the haunt, not the world sheet's 140-spot first pass alone.**
    - Rule: ruling 2B names a 460 px reach, and the consequence it was ruled on (about 4 in 100 close-ups at depth 1 without a beast) was measured as "drawn more than 460 px off".
    - The first pass alone stops near 60 px on open sea and drops more beasts at every depth (R5).
    - The menu's description, "the same 460-pixel reach the world chart searches first", was loose: the world chart's first pass also stops at 140 spots. The design builds the 460 px Alex read.

## Open decisions

none

## Stop conditions

Hand back, naming the line and the command, if any of these happens:

- **A planned file moved.** `git diff --stat 7200fdbb origin/main -- src/world/region.ts src/render/layers/beasts.ts src/render/map-renderer.ts src/render/context.ts src/site/explorer/worker-client.ts src/site/shared/table-address.ts test/site/region-detail-wiring.test.ts test/society/bestiary.test.ts test/render/region-sea-furniture.test.ts` shows a change.
- **A line is not as quoted.** `beasts: [],` is not in `generateRegionWorld`, or the two `beastCandidates` lines are not as quoted above.
- **A reading misses.** Any T1 to T9 reading differs from the one printed here: a window, a home cell, a label, a count, a distance.
- **A red is the wrong red.** T8 after commit 3, or T9 after commit 5, reds on anything but the reading named there.
- **The sweep disagrees.** Any acceptance tally differs from the planner's, other than the ship counts after Issue #422 merges.
- **Something else moves.** Any test outside the named reds goes red after commits 2, 4 or 6, the hero drift guard and the golden above all.
- **The step 11 window is wrong.** The plate reader finds the inset at the step 11 address does not carry the window `{ u0: 0.6875, v0: 0.74, u1: 0.9375, v1: 0.99 }`.
- **A gate or lint refuses a line written here.** The footgun hook, a lint rule or `test/repo/prose-paths.test.ts` refuses a comment or the spec wording as written.
