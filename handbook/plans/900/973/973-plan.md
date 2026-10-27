# Issue #973 plan: terrain marks give way to place and realm names on a close-up, and a place name steps off its river

**Planned at**: `origin/main` `691338c18054d78979bf73c27bb5be6753e2934d`. Issue #973 comments read: 3 (6354353992, the river rule folded in from Issue #953 Q7; 6452075435, Alex's rulings of 2026-10-27; 6453404326, Alex's ruling on D1 and the correction of ruling 4's premise).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/973#issuecomment-6452075435 (1 nudge, else drop; 2 place and realm names only; 3 every close-up band, world sheets, golden and committed charts untouched; 4 the river rule stays here and reaches the close-ups and the bound atlas's two regional plates, measured on the cost axis first). https://github.com/ahl-gram/Vellum/issues/973#issuecomment-6453404326 (D1: "Yes, same on the maps": the marks rule also reaches the bound atlas's two regional plates; and the record that the plates are not committed output, so ruling 4's stop condition does not fire).

**Open decisions**: none.

**Branch**: `feat/973-names-clear-of-marks`. Archive this file unchanged as `handbook/plans/900/973/973-plan.md` in the first commit.

**Parallel lane**: a planner for Issue #1036 (ruler-straight shores on the deepest close-ups) owns `src/terrain/` and `src/world/`. This plan edits nothing under either; its tests only import `src/world/generate.ts`, `src/world/region.ts` and `src/world/types.ts`. If Issue #1036 lands first it can move this plan's band-5 fixtures; see **Stop conditions**.

## The cost axis, measured before planning (ruling 3 and ruling 4)

Both rules are gated on `world.region !== undefined`, the golden-safe lever `handbook/specs/rulebook.md` names ("A render gate that only region sheets pass"). Measured on a throwaway spike of this exact design in the planner's tree at `691338c1` (`out/973-dry-run/spike.patch`, never committed):

- **No committed chart moves.** `out/973-dry-run/heroes.ts` renders `heroChartSvgs` (`scripts/hero-charts.ts`) with both rules on and byte-compares each with `src/static/charts/` on the same Mac: all seven files (`chart-42-antique`, `-topographic`, `-ink`, `-nautical`, `arms-42-0` to `-2`) print `byte-identical`. `node --test test/site/hero-charts.test.ts` is green with the spike. `npm run og` renders the world sheet (`renderMap(hero, ...)` in `scripts/build-og.ts`), which neither rule reaches.
- **The golden does not move.** `test/world/golden-seed42.test.ts` is a world-generation checksum; green under the spike. The whole unit suite under the spike: `ℹ tests 3217`, `ℹ pass 3217`, `ℹ fail 0` (log `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/87ce182f-ae4b-4bcb-b775-4f68ba5e6de6/scratchpad/973-spike-unit.log`).
- **Ruling 4's premise does not hold, and its STOP does not fire.** The ruling calls the atlas plates committed output. They are not: the two regional plates are `regionPlates` in `src/atlas/compose.ts`, composed at runtime by `composeAtlas` (the CLI's `generated/atlas`, the Print Room's worker); `git check-ignore -v generated/atlas` prints `.gitignore:18:/generated/	generated/atlas`, `git ls-files src/static` lists no atlas plate, and `handbook/specs/rulebook.md` lists the atlas among the generated trees. So the river rule reaches the plates, as ruled, and moves nothing committed. It is built here.
- **The gates are load-bearing, and the drift guard holds them.** With the marks rule's region gate removed, `heroes.ts` prints `DIFFERS` for `chart-42-antique` and `chart-42-ink` and `test/site/hero-charts.test.ts` reds; with the river rule's region gate removed, all four `chart-42-*` charts differ and it reds.
- **Cost tier:** render-only, region-only, cheap and additive. No regen, no re-pin, no re-roll slot.
- **Render time:** a band-5 region render (chart 15) takes a median 50 to 53 ms with or without the marks rule over two runs each (`out/973-dry-run/timing.ts`); the change is inside the noise.
- **The bodies below were run as written.** The spike was brought to this plan's exact `nameSetting`, `placeSettlementLabel`, `reliefKind`, `bearsTree`, `markStandsOn`, `markGround`, `marksClearOf` and `boxMeetsRiver` (`out/973-dry-run/spike.patch`), then `npx prettier --write` and `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` over the five files (exit 0), `npx tsc --noEmit` (no error but the spike's own `process.env` toggle, which the build does not carry), and `heroes.ts` again (seven files byte-identical).

## What the change does to a reader's sheets (the measured before and after)

Instrument: `out/973-dry-run/render.ts` (renders each sheet), `probe.ts` (a real browser through `shootAll` in `scripts/design/shoot.ts`, reading every name's and mark's rendered box, the same probe as the Issue #953 plate read), `measure.ts`, `analyze.ts`. Validated by reproducing the Issue #953 read's own figures on its own sheets: `realm-border-15-b5-built` 19 marks on a realm name and 42% of realm-name area under marks, `realm-river-border-7-b5-built` 8 and 13% (`out/973-dry-run/table-check953.md`). 36 region sheets, each drawn today, with the river rule alone, and with both rules: the 19 windows of the Issue #953 plate read (their stamped windows and titles, legend on), Tze's window, the two atlas plates of charts 42, 15, 7 and 23, and band 1 and band 2 round each of those capitals. Tables: `out/973/table-marks-and-rivers.md`, `out/973/table-nudged-dropped.md`.

- Realm-name area under marks: today up to 42% (chart 15, band 5); with the rule, 0% on all 36 sheets.
- Sheets with no mark on a place name: 3 of 36 today, 23 of 36 with the rule. The 13 others keep a graze, 31 mark and name pairs in all, almost all under 2 px deep; the deepest is 6.2 px into the end of the bold capital NUMOWOPUA (chart 7, band 1), whose rendered width runs 26 px past the house's estimate (`textBox` with `WIDTH_FACTOR.caps`, 162.7 px against 188.7 px rendered).
- Marks: of 19,176, 18,551 stay exactly where drawn, 443 slide clear, 182 are dropped. By kind: mountains 194 slid and 34 dropped, hills 83 and 27, trees 155 and 106, marsh 10 and 15, dunes 1 and 0. Longest slide 20.1 px (band 5). These counts and the two tables were taken before the spike rounded a slid mark to the tenth of a pixel (step 3 of design B); every reading quoted under **Tests** was retaken with the rounding in place.
- River ink inside place names (the length of drawn river centreline inside each name's rendered box): today 15 of 36 sheets carry some, up to 63.5 px a sheet; with the river rule, 0 on every sheet but two, where the fallback kept a name with no dry spot free: the mill name Mangkoa Mill (chart 42, band 5) and the seat WEKI (chart 42, band 1). Tze (chart 23, band 5): 22.3 px today, 0 after (it moves from the east side to the west).
- Place names drawn: identical on all 36 sheets in all three arms (`out/973-dry-run/names-lost.ts today both` prints `names in today missing from both: 0`). Without the fallback pass the same sheets lose exactly one name, Mangkoa Mill (`names-lost.ts both nopass2`).
- The river rule moves 1 to 5 labels a sheet on 18 sheets (Tze, Pong, Lokai, Loatunui, Nanawotani, STAL and others), and once a realm name with them (THE on the seed 15 second plate).

## Specs

Read these before building, at these sections, on top of what `CLAUDE.md`'s table owes:

- `handbook/specs/rulebook.md`: "The cost axis and ordering principle"; "Golden and committed-chart discipline", the bullet "Some levers are golden-safe by construction" (the region gate) and "NEVER byte-compare SVGs rendered in different environments"; "Durable engineering constraints", the "Mixed projections" bullet (its `castleGlyph` citation changes path here).
- `handbook/specs/chart-dress.md`: "A river keeps its name over a graze" (label priority, and "Terrain glyphs are the exception that reserve nothing"), which the new paragraphs sit beside.
- `handbook/specs/region-and-voyage.md`: "Region worlds and level of detail", the bullets "A deep close-up keeps band 3's density of terrain marks", "A window off the band lattice gets none of a band-parameterized guard's coverage", "A region-only change leaves the world sheets byte-identical".
- `handbook/specs/engine-invariants.md`: "Fork derivation" (why the yield runs after every draw) and "Measuring a world in a script" (the test fixtures build worlds with `defaultRecipe(seed)` then `generateWorld`).
- `handbook/specs/check-placement.md`: "The unit suite" (why every guard here is a unit test) and "The browser lanes and a plate read" (what the plate reader reads at step 11).
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" and "How code is cited" (the doctrine edits), and the comment rule (none of the new code carries a comment).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 (every test below), Gate 7 items 1 and 2 (the SVG readers in `test/render/close-up-names.test.ts`), Gate 6 (renderer change, item 7: name the no-regen command).

## The design

### A. The river rule (`placeSettlementLabel` in `src/render/layers/settlements.ts`)

On a region sheet, a settlement's name tries its eight candidates (`labelCandidates`) twice. The first pass takes the first candidate whose box is inside the frame, covers no river cell, and claims (`labels.tryClaim`). Only if none does, the second pass is today's loop unchanged: the first candidate inside the frame that claims. Only if neither finds one, today's forced placement: a capital, seat or town name takes `tries[0]` unclaimed; a village, hamlet, farmstead or mill name is dropped. On a world sheet only the second pass runs, which is today's code, so world sheets are byte-identical.

A box "covers a river cell" when the square of any cell marked in `world.riverCells` (the cell's centre plus or minus half a cell, through the affine projection `grid = (px - margin) / scale`) meets the box (`boxMeetsRiver` in the new `src/render/layers/river-clearance.ts`). `riverCells` is `markRiverCells` over every river the close-up draws (`regionWaters` in `src/world/region.ts`), and the union of those squares contains the drawn centreline, so a name the first pass places has no river centreline inside its box.

The candidates and their boxes are computed by a new exported `nameSetting`, the lines `placeSettlementLabel` already holds moved out, so a test reads the same candidates the placer tries.

### B. The marks rule (`glyphsLayer` in `src/render/layers/glyphs.ts`, `marksClearOf` in the new `src/render/layers/glyph-clearance.ts`)

On a region sheet, after `glyphVariants` has drawn every mark (so no rng draw moves), each mark is checked against the boxes of every drawn place name and realm name:

1. A mark's box is its symbol's geometric extent (`SYMBOL_EXTENT` in `src/render/layers/glyph-symbols.ts`, the exact bounds of the symbol's paths) times its scale, at its translate.
2. A mark whose box meets no name box within `MARK_NAME_PAD * k` (`boxesOverlap` in `src/render/geometry.ts` with that pad) is kept exactly as drawn.
3. Otherwise its slides are listed: for each name box it meets, four straight slides that clear that box by the pad plus 0.1 px (up, down, left, right, in that order), sorted by length, ties kept in list order. It takes the first slide no longer than its kind's reach whose moved position, rounded to the tenth of a pixel the layer writes, gives a box that meets no name box within the pad and whose cell (`Math.round((x - margin) / scale)`, the same for y, inside `[1, w - 2]` by `[1, h - 2]`, above sea level) carries the mark's own kind (`markStandsOn`). Once a slide is longer than the reach, the mark is dropped; a mark with no acceptable slide is dropped.
4. Reach: `NUDGE_REACH * MARK_SPACING[kind] * spread`, half the kind's own spacing at this sheet (`prunePoints` spacing in `pickGlyphSpots`), with `spread` as `glyphsLayer` computes it.
5. The names: every settlement label the settlements layer draws (claimed, fallen back or forced), and every realm name the feature labels draw (claimed or forced), the realm's box being its `RealmAnchor`'s extent (`realmNameBox`), which equals the box `placeRealmLabel` claims (`spacedTextBox` with `WIDTH_FACTOR.caps`; same width, top `y - fs`, height `1.2 * fs`).

A world sheet skips step 2 onward, so its glyph layer is byte-identical.

### C. Threading

`labelledLayers` in `src/render/map-renderer.ts` already runs before `mapLayersFor` builds the glyph layer. It now returns `nameBoxes`, the settlement name boxes the settlements draft hands back plus each realm anchor's box, and `mapLayersFor` passes them to `glyphsLayer(ctx, labelled.nameBoxes)`. The label arena is not consulted and not claimed: it also holds the cartouche, scale bar, legend, compass, sea, lake and sea-beast claims, which ruling 2 excludes, and a mark's claim would block the names placed after it.

### D. The split that keeps `src/render/layers/settlements.ts` under 400 lines

Today 387 lines; the spike, with this plan's bodies and before the split, reached 404 after `npx prettier --write`. Its marks half (every function that draws a settlement's mark, a seat halo or a ruin, and the constants they share) moves, unchanged, to the new `src/render/layers/settlement-marks.ts`, in its own commit before any behaviour change.

### Alternatives rejected

- **Query or claim the label arena for the marks rule.** The arena holds every claim on the sheet, not only place and realm names (ruling 2), and a claim by a mark would push the river, lake and forest names and the sea beast placed later.
- **Yield inside `pickGlyphSpots`, before the variants are drawn.** A dropped candidate shifts every later `jrng` and `grng` draw, so marks that meet no name would move too.
- **Test the river at the drawn polyline with its stroke width.** More code for the same outcome: the cell squares already contain the centreline, and the comment's own design is the cell test. The widest stroke can reach about half a cell past the squares; the measured river ink inside a first-pass name is 0 on every sheet.
- **One pass, dropping a name with no dry spot.** Loses a name to its river: Mangkoa Mill vanishes on chart 42 at band 5.
- **The river rule on world sheets too.** Moves all four committed `chart-42-*` charts, which the rulings keep still.
- **Clear the rendered lettering instead of the estimated box.** The engine has no font metrics; widening `WIDTH_FACTOR` moves every label on every world sheet (a regen) and reaches far past this issue.
- **Marks reserve their boxes before the names are placed.** The opposite priority to ruling 1.

## Files

| file | change |
|---|---|
| `src/render/layers/river-clearance.ts` (new, about 20 lines) | `export type RiverGrid = { readonly cells: Uint8Array; readonly w: number; readonly h: number };` and `export function boxMeetsRiver(box: Box, rivers: RiverGrid, proj: Projection): boolean`. Body below. |
| `src/render/layers/settlement-marks.ts` (new, about 200 lines) | Moved unchanged from `src/render/layers/settlements.ts`: `export type SettlementTier = NamedSettlement["kind"] \| "seat";`; the constants `CAPITAL_GLYPH_SCALE`, `HOUSE_SCALE`, `WHEEL_RADIUS`, `SPOKE_WIDTH`, `SEAT_GLYPH_SCALE`, `HALO_OPACITY`; `settlementGlyph` (exported, with its one-line doc comment), `farmsteadGlyph`, `WHEEL_SPOKES`, `millGlyph`, `finerMarkBox` (exported), `starInCircle`, `seatHalo` (now exported, signature unchanged), `ruinGlyph` (exported), `castleGlyph`, `starPath`. Imports: `el`, `pathFrom`, `type SvgNode` from `../svg.ts`; `type Box` from `../geometry.ts`; `type RenderCtx` from `../context.ts`; `type NamedSettlement` from `../../world/types.ts`. |
| `src/render/layers/settlements.ts` | Keeps `FINER_TIER`, `FONT_SIZE`, `REGION_FONT_SIZE`, `LabelAnchor`, `LabelCandidate`, `labelCandidates`, `labelNode`, `OrderedSettlement`, `settlementOrder`, `placeSettlementLabel`, `settlementGroup`, `SettlementsDraft`, `settlementsLayer`. Imports `finerMarkBox`, `ruinGlyph`, `seatHalo`, `settlementGlyph`, `type SettlementTier` from `./settlement-marks.ts` (no re-export), `boxMeetsRiver` from `./river-clearance.ts`, `type Projection` from `../transform.ts`; `pathFrom` is no longer imported. New: `export type NameTry`, `export type NameSetting`, `export function nameSetting(...)`, module-private `type PlacedName`. Changed: `placeSettlementLabel`, `settlementGroup`, `SettlementsDraft`, `settlementsLayer`. About 225 lines. Bodies below. |
| `src/render/layers/legend-icons.ts` | `import { settlementGlyph, ruinGlyph, type SettlementTier } from "./settlement-marks.ts";` in place of `./settlements.ts`. Nothing else. |
| `test/society/farmsteads-ground.test.ts` | `import { finerMarkBox } from "../../src/render/layers/settlement-marks.ts";` in place of `settlements.ts`. Nothing else. |
| `src/render/layers/glyph-symbols.ts` | Add `export const SYMBOL_EXTENT: Readonly<Record<string, readonly [number, number, number, number]>>`, `[left, top, right, bottom]` in symbol units: `gl-mtn-1` `[-9, -13, 9, 0]`, `gl-mtn-2` `[-10, -11, 10, 0]`, `gl-mtn-3` `[-8, -12, 8, 0]`, `gl-hill-1` `[-7, -3.5, 7, 0]`, `gl-hill-2` `[-8, -4.5, 8, 0]`, `gl-tree-round` `[-3.4, -8.8, 3.4, 0]`, `gl-tree-pine` `[-3, -9.5, 3, 0]`, `gl-tree-palm` `[-5, -10.6, 5.6, 0]`, `gl-marsh` `[-6, -7, 6, 0]`, `gl-dune` `[-6, -2, 7, 0]` (each checked against the paths by `out/973-dry-run/extents.ts`: all ten `MATCH`). The symbols themselves are unchanged. |
| `src/render/layers/glyph-clearance.ts` (new, about 85 lines) | `export type MarkKind = "mtn" \| "hill" \| "tree" \| "marsh" \| "dune";` `export type Mark = { readonly x: number; readonly y: number; readonly symbol: string; readonly scale: number; readonly kind: MarkKind };` `export type MarkGround = { readonly pad: number; readonly reach: (kind: MarkKind) => number; readonly stands: (kind: MarkKind, x: number, y: number) => boolean };` `export const MARK_NAME_PAD = 2;` `export const NUDGE_REACH = 0.5;` module-private `const NUDGE_OVERSHOOT = 0.1;` `export function markBox(m: Pick<Mark, "x" \| "y" \| "symbol" \| "scale">): Box` `export function realmNameBox(a: RealmAnchor): Box` `export function marksClearOf(marks: ReadonlyArray<Mark>, names: ReadonlyArray<Box>, ground: MarkGround): Mark[]`. Imports `boxesOverlap`, `type Box` from `../geometry.ts`, `SYMBOL_EXTENT` from `./glyph-symbols.ts`, `type RealmAnchor` from `./feature-labels.ts`. Bodies below. |
| `src/render/layers/glyphs.ts` | `type Glyph` is deleted and every use becomes `Mark`; `glyphVariants` sets `kind` on each mark it pushes (`"mtn"`, `"hill"`, `"tree"`, `"marsh"`, `"dune"`). New: `export const MARK_SPACING: Readonly<Record<MarkKind, number>> = { mtn: 15, hill: 13, tree: 12.5, marsh: 12, dune: 17 };` read by `pickGlyphSpots` in place of its five literals; module-private `type ReliefKind = Exclude<MarkKind, "tree">`, `function reliefKind(rel: number, b: number): ReliefKind \| null`, `const bearsTree = (rel: number, b: number): boolean => rel <= GLYPH_MTN_REL && TREE_BIOMES.has(b);`; `export function markStandsOn(kind: MarkKind, rel: number, b: number): boolean`; module-private `function markGround(ctx: RenderCtx, spread: number): MarkGround`. `glyphCandidates` classifies through `reliefKind` and `bearsTree`. Signature change: `export function glyphsLayer(ctx: RenderCtx, names: ReadonlyArray<Box>): SvgNode \| null`. `terrainGlyphsPresent` is left as it is. About 250 lines. |
| `src/render/map-renderer.ts` | `LabelledLayers` gains `readonly nameBoxes: ReadonlyArray<Box>`; `labelledLayers` reads `settlementsDraft.finish()` as `{ node, nameBoxes }` and returns `settlements: node` and `nameBoxes: [...nameBoxes, ...featureLabels.realmAnchors.map(realmNameBox)]`; `mapLayersFor` calls `glyphsLayer(ctx, labelled.nameBoxes)`. Imports `realmNameBox` from `./layers/glyph-clearance.ts` and `type Box` from `./geometry.ts`. Its existing comment line stays. |
| `test/render/river-clearance.test.ts` (new) | R1 to R4 below. |
| `test/render/glyph-clearance.test.ts` (new) | G1 to G9 below. |
| `test/render/close-up-names.test.ts` (new) | I1 to I5 below. |
| `handbook/specs/chart-dress.md`, `handbook/specs/region-and-voyage.md`, `handbook/specs/rulebook.md` | **Rosters and doctrine** below. |
| `handbook/plans/900/973/973-plan.md` (new) | This plan, unchanged. |

No file under `src/world/`, `src/terrain/`, `src/site/` or `e2e/` changes. `src/render/layers/feature-labels.ts` is not edited (390 lines, and `featureLabelsLayer` sits near the function cap).

### Bodies

`boxMeetsRiver`:

```ts
export function boxMeetsRiver(box: Box, rivers: RiverGrid, proj: Projection): boolean {
  const toGrid = (p: number): number => (p - proj.margin) / proj.scale;
  const gx0 = Math.max(0, Math.ceil(toGrid(box.x) - 0.5));
  const gx1 = Math.min(rivers.w - 1, Math.floor(toGrid(box.x + box.w) + 0.5));
  const gy0 = Math.max(0, Math.ceil(toGrid(box.y) - 0.5));
  const gy1 = Math.min(rivers.h - 1, Math.floor(toGrid(box.y + box.h) + 0.5));
  for (let gy = gy0; gy <= gy1; gy++) {
    for (let gx = gx0; gx <= gx1; gx++) {
      if (rivers.cells[gx + gy * rivers.w] === 1) return true;
    }
  }
  return false;
}
```

`nameSetting` and `placeSettlementLabel` (the lines of today's `placeSettlementLabel` that compute `k`, `sized`, `fs`, `small`, `gap`, `upper`, `text`, `display`, `wf`, `ls` move into `nameSetting` verbatim; `px` and `py` become `proj.px(s.x)` and `proj.py(s.y)`, which is what `settlementGroup` passes today):

```ts
export type NameTry = { readonly at: LabelCandidate; readonly box: Box };
export type NameSetting = { readonly display: string; readonly fs: number; readonly tries: ReadonlyArray<NameTry> };

export function nameSetting(world: World, proj: Projection, s: NamedSettlement, tier: SettlementTier): NameSetting {
  // today's k, sized, fs, small, gap, upper, text, wf, ls lines, unchanged
  const tries = labelCandidates(proj.px(s.x), proj.py(s.y), fs, gap).map((at) => ({
    at,
    box: textBox(at.x, at.y, text, fs, at.anchor, wf, ls),
  }));
  return { display: upper ? text.toUpperCase() : text, fs, tries };
}

type PlacedName = { readonly node: SvgNode; readonly box: Box };

function placeSettlementLabel(ctx: RenderCtx, s: NamedSettlement, tier: SettlementTier): PlacedName | null {
  const { world, proj, labels } = ctx;
  const { display, fs, tries } = nameSetting(world, proj, s, tier);
  const inFrame = (b: Box): boolean =>
    b.x >= proj.margin + 4 &&
    b.x + b.w <= proj.widthPx - proj.margin - 4 &&
    b.y >= proj.margin + 4 &&
    b.y + b.h <= proj.heightPx - proj.margin - 4;
  const rivers = world.region === undefined ? null : { cells: world.riverCells, w: world.elev.w, h: world.elev.h };
  const dry = (b: Box): boolean => rivers === null || !boxMeetsRiver(b, rivers, proj);
  const claimed =
    tries.find(({ box }) => dry(box) && inFrame(box) && labels.tryClaim(box)) ??
    (rivers === null ? undefined : tries.find(({ box }) => inFrame(box) && labels.tryClaim(box)));
  const forced = tier !== "village" && tier !== "hamlet" && !FINER_TIER.has(tier) ? tries[0] : undefined;
  const placed = claimed ?? forced;
  if (placed === undefined) return null;
  const { at, box } = placed;
  return { node: labelNode(display, tier, at.x, at.y, at.anchor, fs, !!s.ruined, ctx), box };
}
```

The two bodies above are the finished form, after commit 8. On the way there:

- **Commit 4** adds `nameSetting` and gives `placeSettlementLabel` the parameters `(ctx: RenderCtx, s: NamedSettlement, tier: SettlementTier)` (and `settlementGroup` calls it so), still returning `SvgNode | null` with today's single pass: `const claimed = tries.find(({ box }) => inFrame(box) && labels.tryClaim(box));`, then `forced` and `placed` as above, then `return labelNode(display, tier, placed.at.x, placed.at.y, placed.at.anchor, fs, !!s.ruined, ctx);`. Nothing else in the file changes.
- **Commit 5** adds `rivers`, `dry` and the two-pass `claimed` exactly as above; the return type is still `SvgNode | null` and the return line is commit 4's.
- **Commit 8** adds `type PlacedName`, returns `PlacedName | null` as above, and changes `settlementGroup`, `SettlementsDraft`, `settlementsLayer` and `labelledLayers` as below.

`settlementGroup` keeps its signature's parameters and returns `{ readonly node: SvgNode; readonly nameBox: Box | null }`: it calls `placeSettlementLabel(ctx, s, tier)`, pushes `label.node` when there is one, builds the same `g` as today as `node`, and returns `{ node, nameBox: label?.box ?? null }`. `export type SettlementsDraft = { readonly finish: () => { readonly node: SvgNode; readonly nameBoxes: ReadonlyArray<Box> } };` and `settlementsLayer`'s `finish` builds `const groups = [...early, ...finer.map((entry) => settlementGroup(ctx, entry, seatRealm, showHalo))];` and returns `{ node: el("g", { id: "layer-settlements" }, groups.map((g) => g.node)), nameBoxes: groups.flatMap((g) => (g.nameBox ? [g.nameBox] : [])) }`. The finer tier is still built inside `finish`, after the feature labels, as today.

`glyph-clearance.ts`:

```ts
export function markBox(m: Pick<Mark, "x" | "y" | "symbol" | "scale">): Box {
  const [x0, y0, x1, y1] = SYMBOL_EXTENT[m.symbol]!;
  return { x: m.x + x0 * m.scale, y: m.y + y0 * m.scale, w: (x1 - x0) * m.scale, h: (y1 - y0) * m.scale };
}

export function realmNameBox(a: RealmAnchor): Box {
  return { x: a.cx - a.halfW, y: a.cy - a.halfH, w: 2 * a.halfW, h: 2 * a.halfH };
}

const tenth = (v: number): number => Math.round(v * 10) / 10;

type Slide = { readonly dx: number; readonly dy: number; readonly len: number; readonly order: number };

function slidesClear(b: Box, met: ReadonlyArray<Box>, pad: number): Slide[] {
  const p = pad + NUDGE_OVERSHOOT;
  return met
    .flatMap((n) => [
      { dx: 0, dy: n.y - p - (b.y + b.h) },
      { dx: 0, dy: n.y + n.h + p - b.y },
      { dx: n.x - p - (b.x + b.w), dy: 0 },
      { dx: n.x + n.w + p - b.x, dy: 0 },
    ])
    .map((d, order) => ({ ...d, len: Math.abs(d.dx) + Math.abs(d.dy), order }))
    .sort((a, c) => a.len - c.len || a.order - c.order);
}

export function marksClearOf(marks: ReadonlyArray<Mark>, names: ReadonlyArray<Box>, ground: MarkGround): Mark[] {
  const metBy = (b: Box): Box[] => names.filter((n) => boxesOverlap(b, n, ground.pad));
  const nudged = (m: Mark, met: ReadonlyArray<Box>): Mark | null => {
    for (const s of slidesClear(markBox(m), met, ground.pad)) {
      if (s.len > ground.reach(m.kind)) return null;
      const moved = { ...m, x: tenth(m.x + s.dx), y: tenth(m.y + s.dy) };
      if (metBy(markBox(moved)).length === 0 && ground.stands(m.kind, moved.x, moved.y)) return moved;
    }
    return null;
  };
  return marks.flatMap((m) => {
    const met = metBy(markBox(m));
    if (met.length === 0) return [m];
    const moved = nudged(m, met);
    return moved ? [moved] : [];
  });
}
```

`glyphs.ts` (the parts that change):

```ts
function reliefKind(rel: number, b: number): ReliefKind | null {
  if (rel > GLYPH_MTN_REL) return "mtn";
  if (rel > GLYPH_HILL_REL) return "hill";
  if (b === BIOMES.marsh) return "marsh";
  if (b === BIOMES.desert) return "dune";
  return null;
}

export function markStandsOn(kind: MarkKind, rel: number, b: number): boolean {
  return kind === "tree" ? bearsTree(rel, b) : reliefKind(rel, b) === kind;
}

// in glyphCandidates: const byRelief: Record<ReliefKind, Cand[]> = { mtn, hill, marsh, dune }; declared beside the five arrays,
// and the loop body after `const c = { x: gx, y: gy, rel, i };` becomes:
const relief = reliefKind(rel, b);
if (relief !== null) byRelief[relief].push(c);
if (bearsTree(rel, b)) tree.push(c);

function markGround(ctx: RenderCtx, spread: number): MarkGround {
  const { world, proj, elevSpan } = ctx;
  const { w, h, data } = world.elev;
  const k = proj.widthPx / 1500;
  return {
    pad: MARK_NAME_PAD * k,
    reach: (kind) => NUDGE_REACH * MARK_SPACING[kind] * spread,
    stands: (kind, x, y) => {
      const gx = Math.round((x - proj.margin) / proj.scale);
      const gy = Math.round((y - proj.margin) / proj.scale);
      if (gx < 1 || gy < 1 || gx > w - 2 || gy > h - 2) return false;
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e <= world.seaLevel) return false;
      return markStandsOn(kind, (e - world.seaLevel) / elevSpan, world.biomes[i] as number);
    },
  };
}

export function glyphsLayer(ctx: RenderCtx, names: ReadonlyArray<Box>): SvgNode | null {
  // today's lines down to `const grng = jrng.fork("variants");`, unchanged
  const marks = glyphVariants(world, grng, picked, size);
  return glyphUses(world.region === undefined ? marks : marksClearOf(marks, names, markGround(ctx, spread)));
}
```

The two comment lines inside the `glyphCandidates` snippet above are the plan's, not code: write no comment in the source.

## Tests, in the order they are written

Every expected reading below was taken on the spike at `691338c1` by the planner's scripts (`out/973-dry-run/unit-readings.ts`, `witness.ts`, `extents.ts`), which compute exactly what each test reads. No browser check is added, so none owes browser readings: every rule here acts on boxes the unit suite computes (`handbook/specs/check-placement.md`, the cheapest instrument that can see it), and the rendered lettering is the plate reader's at step 11.

### `test/render/river-clearance.test.ts` (commit 1, red against the stub)

Fixture: `const proj = createProjection(10, 10, 100, 10);` (margin 10, scale 80/9); `const at = (g: number): number => 10 + g * proj.scale;`; a grid helper building a 10 by 10 `Uint8Array` with the named cells set to 1. Stub (commit 1): `river-clearance.ts` exports the real `RiverGrid` type and `boxMeetsRiver` returning `false`.

- **R1** `a name box over a river cell's centre meets the river`: cell (5, 5); box `{ x: at(5) - 1, y: at(5) - 1, w: 2, h: 2 }`; `assert.equal(boxMeetsRiver(box, grid, proj), true)`. Red at the stub. Mutation: return `false` always.
- **R2** `a name box reaching into a river cell's square, short of its centre, meets the river`: cell (5, 5); box from `at(5.3)` to `at(6.9)` across, `at(4.8)` to `at(5.2)` down; `true`. Red at the stub. Mutation: drop both `- 0.5` and `+ 0.5` (test cell centres only), which reads `false`.
- **R3** `a name box clear of every river cell's square misses the river`: cell (5, 5); box from `at(5.6)` to `at(6.4)` across, `at(4.8)` to `at(5.2)` down; `false`. Green at the stub (its red is the mutation). Mutation: return `true` always.
- **R4** `a box past the grid's right edge reads no cell of the next row`: cell (0, 6) only; box from `at(9.6)` to `at(10.4)` across, `at(4.8)` to `at(5.2)` down; `false`. Green at the stub. Mutation: drop the `Math.min(rivers.w - 1, ...)` clamp on `gx1`, which reads cell index `10 + 5 * 10`, cell (0, 6), and returns `true`.

### `src/render/layers/settlement-marks.ts` split (commit 3, no test of its own)

A pure move. Held by the existing tests: `test/site/hero-charts.test.ts` (world sheets byte-identical), `test/render/settlements.test.ts`, `test/render/legend.test.ts`, `test/society/farmsteads-ground.test.ts`.

### `test/render/close-up-names.test.ts`, the river half (commit 4)

Fixtures (module scope, built once): `defaultRecipe(seed)` then `generateWorld`, then `generateRegionWorld(world, { window, gridW: 320, gridH: 240, title, detail })`, rendered by `renderMap(region, { style: "antique", widthPx: 1500, legend: true })`:

- `TZE_B5`: seed 23, window `{ u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 }` (the comment's witness), title `"The Environs (band 5)"`, `detail: true`.
- `MANGKOA_B5`: seed 42, window `{ u0: 0.49609375, v0: 0.3828125, u1: 0.52734375, v1: 0.4140625 }`, title `"The Environs (band 5)"`, `detail: true`.

Readers (in the test file): a settlement group is found by `svg.indexOf('data-name="<name>"')`, asserted `!== -1`, and its slice runs to the next `<g class="settlement"` or, failing that, to `<g id="layer-feature-labels"` (asserted found), so a group with no label cannot borrow its neighbour's. The group's tier is the `data-tier="..."` immediately before that `data-name`. Its drawn label is `textNodes(slice)` from `test-support/label-geometry.ts`. The projection is `createProjection(region.elev.w, region.elev.h, 1500, marginFor(1500))`; the river grid `{ cells: region.riverCells, w: region.elev.w, h: region.elev.h }`; the candidates `nameSetting(region, proj, s, tier).tries`, and the drawn candidate is the index whose `at.x`, `at.y` and `at.anchor` equal the drawn node's `x`, `y` and `anchor` exactly (the SVG writes the full number, so they round-trip), asserted `>= 0`.

- **I4** `a place name steps off its river on a close-up (Tze, chart 23, band 5)`: precondition `boxMeetsRiver(tries[0].box, rivers, proj) === true` (Tze's first choice sits on its river: candidates read `W..WWW..`, W wet); outcome: the drawn candidate's box `=== false`. Readings: today the drawn candidate is 0 and wet; built it is 1 (the west side, `text-anchor="end"`) and dry. Red at commit 4 on the outcome (the placer has no river test yet). Mutation: replace `dry(box)` with `true` in the first pass, which draws candidate 0.
- **I5** `a place name with no dry spot free keeps its place on its river (Mangkoa Mill, chart 42, band 5)`: the group's label slice holds exactly one text node, `"Mangkoa Mill"` (tier `mill`); precondition: its drawn candidate's box `boxMeetsRiver(...) === true` (it came through the second pass: candidates read `.WW...WW`, the drawn one is 2, every dry one is taken or out of frame). Readings: drawn at candidate 2, wet, today and built. Green at commit 4 (today's single pass draws it there); its red is the mutation. Mutation: delete the second pass (`?? (rivers === null ? undefined : ...)`), which drops the name: `names-lost.ts both nopass2` prints `biomes-capital-42-b5.svg: both 11, nopass2 10; only in both: Mangkoa Mill`.

Commit 4 also extracts `nameSetting` (behaviour unchanged: `node --test test/site/hero-charts.test.ts test/render/settlements.test.ts` green), so the test can import it. Commit 5 writes the two passes and turns I4 green.

### `test/render/glyph-clearance.test.ts` (commit 6, red against the stubs)

Stubs (commit 6): `glyph-clearance.ts` with the real types and constants, `markBox` real, `realmNameBox` returning `{ x: 0, y: 0, w: 0, h: 0 }`, `marksClearOf` returning `[...marks]`; `SYMBOL_EXTENT` with all ten ids mapped to `[0, 0, 0, 0]`; `markStandsOn` exported from `glyphs.ts` returning `true` (`glyphCandidates` untouched until commit 7).

Shared fixture: `const N = { x: 100, y: 100, w: 60, h: 20 };`, `const MTN = { x: 130, y: 125, symbol: "gl-mtn-1", scale: 1, kind: "mtn" } as const;` (its box spans x 121 to 139, y 112 to 125, meeting `N`), `const ground = (over = {}) => ({ pad: 2, reach: () => 30, stands: () => true, ...over })`.

- **G1** `every terrain symbol's extent is the exact bounds of the paths glyphSymbolDefs draws`: walk `glyphSymbolDefs(STYLES.antique)`; for each `symbol` node, compute the bounds of every child path's `d` with a parser written in the test that accepts only absolute `M`, `L`, `H`, `Q`, `Z` (throw on any other letter, so a new command reds loudly), taking a quadratic's extremum per axis at `t = (p0 - p1) / (p0 - 2 * p1 + p2)` when `0 < t < 1`; assert the sorted ids `deepEqual` the sorted keys of `SYMBOL_EXTENT`, and each of the four values within `1e-9` of the table's. Red at the stub. Mutation: `gl-mtn-1`'s `-13` to `-12`.
- **G2** `a mark that meets no name is kept exactly as drawn, in order`: marks `[{ x: 300, y: 300, symbol: "gl-hill-1", scale: 1, kind: "hill" }, { ...MTN, x: 500, y: 500 }]`, names `[N]`; `assert.deepEqual(marksClearOf(marks, [N], ground()), marks)`. Green at the stub. Mutation: drop the `if (met.length === 0) return [m];` keep, so each mark goes to the nudge, finds no slide and is dropped.
- **G3** `a mark that meets a name slides the shortest way clear`: `deepEqual(marksClearOf([MTN], [N], ground()), [{ ...MTN, y: 135.1 }])` (the down slide, 10.1, beats up 27.1 and the sideways 41.1). Red at the stub. Mutations: `NUDGE_OVERSHOOT` 0 (reads `y: 135`); sort longest first (the first slide, 41.1, is past the reach, so the mark is dropped).
- **G4** `a mark with no free ground within its kind's reach is dropped`: `ground({ reach: () => 5 })` gives `[]`. Red at the stub. Mutation: return `[m]` instead of `[]` when `nudged` gives `null`.
- **G5** `a slide onto another name is refused for the next shortest`: names `[N, { x: 100, y: 124, w: 60, h: 20 }]`; result `[{ ...MTN, y: 97.9 }]` (the 3.1 slide off the second name lands on `N`, the 10.1 slide off `N` lands on the second, the 27.1 slide up clears both). Red at the stub. Mutation: drop `metBy(markBox(moved)).length === 0 &&` (reads `y: 121.9`).
- **G6** `a slide onto ground the mark's kind does not stand on is refused`: `ground({ stands: (_kind, _x, y) => y < 130 })` gives `[{ ...MTN, y: 97.9 }]`. Red at the stub. Mutation: drop `&& ground.stands(m.kind, moved.x, moved.y)` (reads `y: 135.1`).
- **G7** `a mark's reach is its own kind's`: marks `[MTN, { x: 130, y: 122, symbol: "gl-hill-1", scale: 1, kind: "hill" }]` (the hill's box, y 118.5 to 122, meets `N` within the pad), `ground({ reach: (kind) => (kind === "mtn" ? 30 : 1) })`; result `[{ ...MTN, y: 135.1 }]` (the hill's shortest slide is 3.6 and it is dropped). Red at the stub. Mutation: `ground.reach("mtn")` in place of `ground.reach(m.kind)` (keeps the hill at `y: 125.6`).
- **G8** `each kind stands on the ground it is picked from`: `markStandsOn(kind, rel, BIOMES.x)` against this table (`GLYPH_MTN_REL` 0.5, `GLYPH_HILL_REL` 0.34): mtn 0.6 grassland true; mtn 0.4 grassland false; hill 0.4 grassland true; hill 0.6 grassland false; hill 0.2 grassland false; tree 0.4 temperateForest true; tree 0.6 temperateForest false; tree 0.2 grassland false; marsh 0.1 marsh true; marsh 0.4 marsh false; dune 0.1 desert true; dune 0.1 marsh false. Red at the stub (the false rows). Mutation: `bearsTree` ignores `rel` (the tree 0.6 row reads true).
- **G9** `a realm name's box is its anchor's extent`: `deepEqual(realmNameBox({ realm: 0, cx: 100, cy: 50, halfW: 30, halfH: 6 }), { x: 70, y: 44, w: 60, h: 12 })`. Red at the stub. Mutation: return the stub's zero box.

Commit 7 implements `SYMBOL_EXTENT`, `markBox`, `realmNameBox`, `marksClearOf`, `markStandsOn`, `reliefKind`, `bearsTree`, `MARK_SPACING`, and moves `glyphCandidates` and `pickGlyphSpots` onto them: G1 to G9 green, `test/site/hero-charts.test.ts`, `test/render/terrain-legend.test.ts` and `test/render/glyph-density.test.ts` green (the refactor is byte-identical on world sheets).

### `test/render/close-up-names.test.ts`, the marks half (commit 8, red against the stubbed wiring)

Fixtures added:

- `SEVEN_B5`: seed 7, window `{ u0: 0.26171875, v0: 0.29296875, u1: 0.29296875, v1: 0.32421875 }`, title `"The Environs (band 5)"`, `detail: true` (the Issue #953 read's `realm-river-border-7-b5`, where hills cross THE PAN ATOLLS).
- `STAL_PLATE`: seed 15; `const stal = world.settlements.find((s) => s.name === "Stal")` asserted found; window `windowAround(world, stal, 0.38)`; title `"The Environs of Stal"`; no `detail` (the bare form `regionPlates` in `src/atlas/compose.ts` draws: the bound atlas's second plate for seed 15). This is the fixture off the band lattice `handbook/specs/region-and-voyage.md` asks for.

Readers added: marks from the slice between `<g id="layer-glyphs"` and the next `</g>` (both asserted found; the layer holds only self-closing `use` elements), matched with `/<use href="#([a-z0-9-]+)"[^>]*transform="translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\)"/g`, the match count asserted equal to the count of `<use ` in the slice, each turned into a four-corner polygon through `SYMBOL_EXTENT` at its translate and scale; place names `textNodes` over the slice from `<g id="layer-settlements"` to `<g id="layer-feature-labels"` (both asserted found), each through `glyphPoly(n)`; realm names `textNodes` over the SVG from `<g id="layer-feature-labels"` on, kept where the text is one of `world.names.realms` uppercased, each through `glyphPoly(n)`. Overlap is `polysOverlap` from `test-support/label-geometry.ts`, with no pad. **Call `glyphPoly` with one argument**: `.map(glyphPoly)` hands the array index in as the width factor, and the planner's first reading through it counted 62 marks on place names where there are none. The witness context (in the test file) mirrors `renderContext` in `src/render/map-renderer.ts` for what `glyphsLayer` reads: `world: region`, `style: STYLES.antique`, `proj` as above, `coastRings: []`, `elevSpan: Math.max(1e-9, max - region.seaLevel)` with `max` from `minMax(region.elev)`, `rng: createRng(region.recipe.seed).fork("render")`, `realmTint: []`, `labels: createLabelArena()`; the uncleared marks are `renderSvg(glyphsLayer(ctx, [])!)` read by the same reader.

Stubbed wiring (commit 8): everything in **Files** for `glyphs.ts`, `map-renderer.ts` and `settlements.ts`'s `nameBoxes`, except that `glyphsLayer` calls `marksClearOf(marks, names.slice(0, 0), markGround(ctx, spread))`.

- **I1** `on a close-up no terrain mark meets a place or realm name (chart 7, band 5)`: at least one place name and one realm name drawn; witness: uncleared marks meeting a place name `> 0` and a realm name `> 0`; outcome: the rendered sheet's marks meeting a place name `=== 0` and a realm name `=== 0`. Readings: witness 19 and 6; built 0 and 0; at the commit 8 stub, 19 and 6 (red). Mutations: `glyphsLayer(ctx, [])` in `mapLayersFor` (19 and 6); `nameBoxes` without the realm boxes (place 0, realm 6); without the settlement boxes (place 19, realm 0).
- **I2** `the bound atlas's regional plate clears its names too (chart 15, the plate round Stal)`: the same reads on `STAL_PLATE`. Readings: witness 5 and 26; built 0 and 0; stub 5 and 26 (red). Mutations as I1: `[]` (5 and 26); no realm boxes (place 0, realm 26); no settlement boxes (place 5, realm 0).
- **I3** `every terrain mark on a close-up stands on ground of its own kind`, over `SEVEN_B5` and `STAL_PLATE`: for each mark of the rendered sheet, its kind from its symbol's prefix (`gl-mtn` mtn, `gl-hill` hill, `gl-tree` tree, `gl-marsh` marsh, `gl-dune` dune), its cell `Math.round((x - proj.margin) / proj.scale)` and the same for y; assert the cell's elevation is above `region.seaLevel` and `markStandsOn(kind, rel, region.biomes[i])` with `rel` over the witness context's `elevSpan`; count the marks that fail, assert 0. Readings: built 0 and 0; green at the stub (no mark moves). Mutation: `stands: () => true` in `markGround` (reads 1 on `SEVEN_B5` and 5 on `STAL_PLATE`).

Commit 9 replaces `names.slice(0, 0)` with `names`: I1 and I2 green.

### What the prover owes, and what step 15 leaves to the implementer

`vellum-guard-prover`, one round after commit 10 is pushed, over R1 to R4, G1 to G9, I1 to I5, with the mutations named at each test, plus these two on the existing drift guard (`test/site/hero-charts.test.ts`): `world.region === undefined ? marks :` in `glyphsLayer` replaced by `false ? marks :` (measured red), and `world.region === undefined ? null :` in `placeSettlementLabel` replaced by `false ? null :` (measured red). Mutate by line, not by text (`vellum-footguns` Gate 1 item 9). Any guard changed after that round is the implementer's to prove, by breaking what it guards and watching it red, named in the PR body as proven by the implementing session only.

## Order of commits

1. `#973 The plan, and a river cell under a name box is found (failing)`: `handbook/plans/900/973/973-plan.md`, `test/render/river-clearance.test.ts`, the stub `src/render/layers/river-clearance.ts`. R1 and R2 red on their assertions. Push.
2. `#973 A name box meets the river through the cells it covers`: `boxMeetsRiver`. R1 to R4 green.
3. `#973 A settlement's marks move to their own module`: `src/render/layers/settlement-marks.ts`, the `settlements.ts` imports, `src/render/layers/legend-icons.ts`, `test/society/farmsteads-ground.test.ts`, and the citation in `handbook/specs/rulebook.md`.
4. `#973 A name's candidates are read where the placer reads them; Tze still sits on its river (failing)`: `nameSetting`, `placeSettlementLabel` taking `(ctx, s, tier)` and still returning `SvgNode | null`, and `test/render/close-up-names.test.ts` with I4 (red) and I5 (green).
5. `#973 A place name on a close-up steps off its river`: the two passes, return type unchanged. I4 green, I5 green.
6. `#973 Terrain marks give way to names, written as tests (failing)`: `test/render/glyph-clearance.test.ts` and its stubs. G1, G3 to G9 red.
7. `#973 A mark slides clear of a name onto its own ground, or drops`: the implementations. G1 to G9 green, world sheets byte-identical.
8. `#973 The names reach the glyph layer; the marks still cover them (failing)`: `PlacedName`, `settlementGroup`'s `nameBox`, `SettlementsDraft`'s `nameBoxes`, `labelledLayers`' `nameBoxes`, the `glyphs.ts` wiring with `names.slice(0, 0)`, and I1 to I3. I1 and I2 red.
9. `#973 Terrain marks give way to place and realm names on a close-up`: `names`. I1 to I3 green.
10. `#973 The chart's dress records both close-up rules`: the doctrine edits below.

Run `npm run format` before each commit. Push at commit 1, and at every commit after.

## Rosters and doctrine

No roster lists the render layers (checked: `git grep -n "render/layers"` over `test-support/source-read-list.ts`, `eslint.config.ts`, `tsconfig*.json`, `scripts/lint` prints nothing). The new test files join nothing by hand.

1. `handbook/specs/chart-dress.md`: insert two paragraphs directly after the paragraph that opens "**A river keeps its name over a graze.**":

   > **On a close-up, a terrain mark gives way to a place or realm name.** Once every name on a region sheet is placed, each mark of the glyph layer (a mountain, hill, tree, marsh or dune) whose box, its symbol's extent (`SYMBOL_EXTENT` in `src/render/layers/glyph-symbols.ts`) times its scale, comes within `MARK_NAME_PAD` of a place name's or a realm name's box is slid the shortest straight way clear of it, no farther than `NUDGE_REACH` of its kind's spacing (`MARK_SPACING` in `src/render/layers/glyphs.ts`), onto a cell its own kind stands on (`markStandsOn` there), and is dropped where no such spot is free (`marksClearOf` in `src/render/layers/glyph-clearance.ts`). The yield runs after every draw the layer makes, so a mark that meets no name stands exactly where it was drawn. A name's box is the one its placement claimed, the house's estimate of its width rather than the drawn letters, so the end of a long name can still graze a mark. The marks still reserve nothing in the arena: a mark gives way to a name and never a name to a mark, and a river's, a lake's or the sea's name is not one a mark gives way to. A world sheet does none of this.
   >
   > **On a close-up, a place name steps off its river.** A settlement's name takes the first of its candidates that covers no cell a river of the close-up is drawn through (`boxMeetsRiver` in `src/render/layers/river-clearance.ts`) and that it can claim, before any candidate on a river; only where every dry candidate is taken does it take the first it can claim, and a capital's, seat's or town's name forced into place keeps its forced spot, so no name is lost to its river (`placeSettlementLabel` in `src/render/layers/settlements.ts`). A world sheet does not do this, so the committed charts stand still.

2. `handbook/specs/region-and-voyage.md`: insert a bullet directly after the bullet that opens "**A deep close-up keeps band 3's density of terrain marks.**":

   > - **On a close-up, terrain marks give way to place and realm names, and a place name steps off its river.** Both act on every region sheet, the bound atlas's regional plates included, and on no world sheet, so the committed charts and the golden stand still; the rules themselves are `handbook/specs/chart-dress.md`'s.

3. `handbook/specs/rulebook.md`, the "Mixed projections" bullet: `` `castleGlyph` (`src/render/layers/settlements.ts`) `` becomes `` `castleGlyph` (`src/render/layers/settlement-marks.ts`) ``. The "A render gate that only region sheets pass" bullet's `REGION_FONT_SIZE` citation stays (`REGION_FONT_SIZE` stays in `src/render/layers/settlements.ts`).

4. `handbook/errata/guards.md` is not edited. Its PR #1024 row cites `finerMarkBox` in `src/render/layers/settlements.ts`, which moves; `handbook/errata/README.md` makes the ledger an archive outside the roots `test/repo/prose-paths.test.ts` walks, "so a row may name a path that later moves", and a row leaves only as that README says.

No other spec, gate or agent line contradicts the change: `RIVER_MAX_OVERLAP`'s comment in `src/render/layers/feature-labels.ts` ("terrain glyphs reserve nothing") stays true, and so does chart-dress's "Terrain glyphs are the exception that reserve nothing". The comment in `src/site/seed-of-the-day/app-hunt.ts` cites `settlementsLayer` in `src/render/layers/settlements.ts`, which stays there; the one in `test/render/place-card.test.ts` cites `tierOf` there, which stays.

## Evidence

- Unit, the new guards: `node --test test/render/river-clearance.test.ts test/render/glyph-clearance.test.ts test/render/close-up-names.test.ts`.
- Unit, what the change can move: `node --test test/site/hero-charts.test.ts test/world/golden-seed42.test.ts test/atlas/compose.test.ts test/render/settlements.test.ts test/render/svg.test.ts test/render/legend.test.ts test/render/terrain-legend.test.ts test/render/glyph-density.test.ts test/society/farmsteads-ground.test.ts test/society/farmsteads.test.ts test/society/hamlets.test.ts`.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- No regen owed: name `node --test test/site/hero-charts.test.ts` green and `git status --porcelain src/static` empty in the PR body (Gate 6 item 7).
- e2e, the suites that read region sheets' settlements and the atlas's composition, each alone, after `npm run build`: `VELLUM_E2E_SUITES=zoom npm run test:e2e`, then `VELLUM_E2E_SUITES=glass-ceremony npm run test:e2e`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`. Never the full local lanes.
- `vellum-plate-reader` is owed at step 11: the deliverable is an appearance. Brief it with the four pairs in `out/973/` (the main checkout's copy) as the control and the planner's instrument in `out/973-dry-run/` (`render.ts`, `probe.ts`, `measure.ts`, `analyze.ts`, `names-lost.ts`) as the method, on the same 36 windows built from the branch: the realm-name area under marks (0% on every sheet is the bar), marks on place names (every graze named with its depth), river ink inside place names, and place names drawn (unchanged from `main` on every sheet). Copy its measured tables into a PR comment with the harness that produced them (workflow step 10).
- The step 12 comment carries **Calls made** below, pointing at comments 6452075435 and 6453404326 for the rulings rather than restating them.

## Calls made (copy into the step 12 comment)

1. **Ruling 4's premise is corrected, and the river rule is built.** The atlas's two regional plates are generated (`git check-ignore -v generated/atlas`; no tracked plate under `git ls-files src/static`; `handbook/specs/rulebook.md` lists the atlas among the generated trees), so the river rule reaches them as ruled and moves no committed chart or the golden (`heroes.ts`: seven files byte-identical; `test/site/hero-charts.test.ts` and `test/world/golden-seed42.test.ts` green). The ruling's own condition, a STOP only if something committed moves, does not fire.
2. **Every kind of terrain mark yields: mountains, hills, trees, marsh and dunes.** Rule: ruling 1 says "a terrain mark", and the house calls every mark of the layer a terrain glyph (`TerrainGlyphs` in `src/render/layers/glyphs.ts`; chart-dress's "Terrain glyphs"); the body's "(hills and mountains)" named what the read found. Measured: 155 trees slid and 106 dropped over 36 sheets.
3. **The names a mark yields to are every drawn place name (capital, seat, town, village, hamlet, farmstead and mill, ruins and forced names included) and every drawn realm name (forced ones included).** Lake names do not count: they are water labels, beside the river names and the sea's name ruling 2 left alone. A region sheet draws no range, forest or river name (`regionNames` in `src/world/region.ts`), so ruling 2 leaves nothing else to decide.
4. **The marks rule reaches every close-up band, 1 to 5, through the region gate (`world.region !== undefined`).** Rule: ruling 3 ("every close-up band, one rule at all depths") and the house's golden-safe lever. Bands 1 and 2, which keep today's mark density, are close-up bands and are included (measured: capital-15-b1 from 17 marks on place names to 3). Its reach onto the atlas's two regional plates is Alex's ruling on D1 (comment 6453404326), not a call.
5. **A nudge is the shortest straight slide clear of a met name, at most half the mark's kind's spacing.** Rule: a slid mark then goes at most halfway toward where its nearest neighbour of the same kind may stand (`prunePoints` spacing), so it never takes a neighbour's place. Measured longest slide: 20.1 px at band 5.
6. **A slid mark must land on ground its kind stands on, or the next slide is tried, else it drops.** Rule: what stands on the land agrees with the land (Issue #953's own title; a mountain slid onto a lowland or into the sea would draw a hill that is not there).
7. **The clearance pad is 2 px at 1500 px wide (`MARK_NAME_PAD`, times `k`).** Derived: the realm name's halo stroke, `3.8 * k`, reaches `1.9 * k` past its letters, the widest of any name's.
8. **A name's box is the house's estimate, not the drawn letters.** Rule: one estimate of where a name stands, shared with the label arena; changing `WIDTH_FACTOR` moves every world chart. Measured consequence: 13 of 36 sheets keep a graze, the deepest 6.2 px at the end of the bold capital NUMOWOPUA (chart 7, band 1).
9. **The yield runs after every random draw of the glyph layer.** Rule: `handbook/specs/engine-invariants.md`, Fork derivation: a mark that meets no name is drawn exactly as today (18,551 of 19,176 on the 36 sheets).
10. **The river test is the cell test the folded-in comment specified**, a box meeting the square of any drawn river cell. Measured: river centreline inside a name placed by the first pass is 0 px on every sheet.
11. **A name with no dry spot free keeps today's spot on its river, and a forced capital's, seat's or town's name keeps its forced spot.** Rule: no name is lost to its river. Measured: 0 names lost on 36 sheets; without this fallback, Mangkoa Mill is lost.
12. **The river rule applies to every place name, not only a town's.** Rule: the comment's fix sits in `placeSettlementLabel`, which places every tier; a mill's or hamlet's name on its river reads the same as a town's.
13. **The marks half of `src/render/layers/settlements.ts` moves to `src/render/layers/settlement-marks.ts`**, so the file stays under the 400-line cap; a pure move, in its own commit.
14. **No browser check is added.** Rule: `handbook/specs/check-placement.md`, the cheapest instrument that sees the rule; every box involved is computed in Node, and the rendered lettering is the plate reader's at step 11.

## Open decisions

none

D1, whether the marks rule also reaches the bound atlas's two regional plates, was put to Alex at the step 6 STOP and ruled "Yes, same on the maps" (comment 6453404326). The design above already gates both rules on `world.region !== undefined`, which the plates pass, and I2 already holds the marks rule on the plate round Stal, so the ruling adds no file, test or line to this plan. `src/atlas/compose.ts` and `RenderOptions` are not touched.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 691338c18054d78979bf73c27bb5be6753e2934d origin/main -- src/render/layers/settlements.ts src/render/layers/glyphs.ts src/render/layers/glyph-symbols.ts src/render/layers/legend-icons.ts src/render/layers/feature-labels.ts src/render/layers/realm-label-placement.ts src/render/map-renderer.ts src/render/geometry.ts src/render/context.ts src/world/region.ts src/hydrology/rivers.ts test-support/label-geometry.ts test/society/farmsteads-ground.test.ts` prints anything before the first commit.
- A witness precondition fails at your commit, here or on CI: Tze's `tries[0]` is not wet (I4), Mangkoa Mill is not drawn on a wet candidate at commit 4 (I5), `Stal` is not found (I2), or an uncleared count in I1 or I2 is 0. The likeliest cause is a terrain or world change landed since `691338c1`, Issue #1036's among them; do not pick another fixture.
- I1 or I2 reads anything but 0 after commit 9, or I3 anything but 0.
- `test/site/hero-charts.test.ts` or `test/world/golden-seed42.test.ts` reds after any commit (a world sheet moved).
- Any unit test outside the three new files reds after commit 9 (the spike ran the whole suite green: `ℹ pass 3217`, `ℹ fail 0`).
- G1's parser meets a path command other than absolute `M`, `L`, `H`, `Q`, `Z`, or an extent does not match the table above.
- `src/render/layers/settlements.ts` or `src/render/layers/glyphs.ts` passes 400 lines, or any function passes 50 (`npm run lint`), after commit 9.
- An importer of `SettlementTier`, `settlementGlyph`, `ruinGlyph`, `finerMarkBox` or `seatHalo` exists beyond `src/render/layers/legend-icons.ts`, `test/society/farmsteads-ground.test.ts` and `settlements.ts` (`git grep -n "SettlementTier\|settlementGlyph\|ruinGlyph\|finerMarkBox\|seatHalo" -- src test e2e scripts test-support`).
- The `zoom` or `glass-ceremony` e2e suite reds on a settlement with no label, or any of the three suites reds at all.
- The prover reports a HOLE on any mutation named above.
