# Issue #850 plan: one mapper hands every terrain input to the world sheet, both close-up arms and the detail chain (closes Issue #453)

- **Planned at:** `origin/main` cbf57b8f01c6e83adfebfc2540d6cbdb9af20815, Issue #850 comment count 1 (6281722236, the 2026-10-19 re-baseline), Epic Issue #844 comment count 8 (6097579255, 6097758352, 6099188094, 6281585030, 6281585596, 6281800234, 6281871579, 6281900768). Measured and quoted at d5d46bcc; `git diff --quiet d5d46bcc cbf57b8f -- src test test-support scripts e2e .github` and the five specs named below exits 0 (main moved only by PR #948 and PR #949, docs), so every line quoted "as at d5d46bcc" is the same at cbf57b8f.
- **Rulings:** Issue #844 comment 6099188094, D2: "fix Issue #453 first, through one mapper ... Every close-up of a non-default coast redraws; no committed chart and no golden moves." Issue #844 comment 6097758352, item 1: the epic's slot is recorded in `handbook/specs/rulebook.md` by the epic's first pull request. This plan's own menu was empty (Open decisions).
- **Open decisions:** none.
- **Branch:** `fix/850-one-terrain-mapper`.
- **Revision:** second draft, after `vellum-plan-skeptic` (its findings are folded in; the draft's one menu item, D1, became Calls made 15).

## What is wrong, measured

- A terrain field is remembered at five places today: the conditional spread in `terrainStage` (`src/world/generate.ts`, lines 79 to 85), the bare arm of `regionElevation` (`src/world/region.ts`, lines 58 to 65), the `ChainSpec` built there (lines 46 to 56), `chainCacheKey` (`src/world/detail-chain.ts`, line 72) and the forward spread in `buildChainedField` (line 143). The coast warp is in three and missing from the two in `region.ts`, so a close-up draws the default coast under a chart drawn with another.
- Measured by the planner at d5d46bcc with `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/850-probe.ts` (it builds the chart, today's two arms and the two arms with the warp passed through, and counts the cells where the close-up's land or sea disagrees with the chart's nearest cell). At seed 2 (archipelago), Issue #453's band-1 window `lodWindowFor(0.5625, 0.4375, 0.5)`, 320 by 240, of 76800 cells:

| coast | bare today | bare passed through | detailed today | detailed passed through |
|---|---|---|---|---|
| absent | 1326 (1.73%) | 1326 (1.73%) | 1143 (1.49%) | 1143 (1.49%) |
| 0.1 | 4696 (6.11%) | 1320 (1.72%) | 4526 (5.89%) | 1116 (1.45%) |
| 0.9 | 4148 (5.40%) | 1246 (1.62%) | 4119 (5.36%) | 1101 (1.43%) |

  These reproduce `out/844-breakdown/region-coast-gap.md` (main checkout) and the re-baseline comment's 1.45% exactly.
- The sweep the bound is derived from (the same probe, 728 rows: seeds 1 to 12 and 42, all four map types; three band-1 lattice windows, two band-2, two band-3 and the atlas's off-lattice 0.38 window; coast absent, 0, 0.1, 0.3, 0.8, 0.9 and 1; both arms; raw rows in `850-probe-seed2.json` and `850-probe-sweep.json`, summarised by `850-analyze.ts`, all in the scratchpad above). With every terrain input passed through, the worst disagreement anywhere is 3.08% (seed 5, archipelago, the band-3 window at (0.25, 0.5), coast 0.1, bare arm); the detailed arm's worst is 2.89% (seed 42, the same window, coast 0.3); band-1 windows never pass 1.73% and the atlas window never passes 1.55%. Today's default rows, where both arms already agree with their chart as well as resampling allows, reach 2.63%. So a close-up that is passed every input sits in the same range as today's default close-ups: the resampling floor.
- The planned test 1, run as a probe against today's code (`850-probe-test2.ts`): on the band-1 window the witness (the chart against the plain world's close-up) reads 6.15% bare and 6.11% detailed at coast 0.1, 5.47% and 5.43% at 0.9, and the drawn close-up 6.11%, 5.89%, 5.40% and 5.36%; on the band-3 window at (0.25, 0.5) the witness reads 9.27%, 8.70%, 13.11% and 13.84%, the drawn close-up 9.53%, 9.05%, 12.94% and 13.53%. The whole test body took 9.20 s.
- An input dropped by the chain's ancestors only (the target keeps it): 3.47% at band 1 coast 0.1 and 4.96% at 0.9; 8.82% and 13.26% at band 3 (`850-probe-test2.ts`, reproducing the plan skeptic's figures).
- Through the fixed builders (`850-probe-after-digests.ts`), the close-up at coast 0.55 written out has the same digests as with no coast at all (bare `c453639d9bdc`, detailed `29649d38b74d`), so nothing at the default moves.

## Specs

- `handbook/specs/engine-invariants.md`, Identity versus view (a recipe field defines the world; this change adds none), World identity is entry-point independent (the world sheet's call keeps its values, so every entry point draws the same world), and Measuring a world in a script (seed first; `Field.at(x, y)`; chart space is not grid space). This pull request adds a section here (Calls made 15).
- `handbook/specs/region-and-voyage.md`, Region worlds and level of detail: the parent is the authority on a crop, the detail level is a function of the window, a window off the band lattice gets none of a band-parameterized guard's coverage (the atlas's 0.38 window, named in the bound's sweep), hold one chain cache across region jobs (the key must change when an input changes), a region-only change leaves the world sheets byte-identical.
- `handbook/specs/rulebook.md`, Golden and committed-chart discipline (the golden `1792806240` and the hero drift guard must not move; no regen) and Scheduling rules (the slot line this pull request adds).
- `handbook/specs/check-placement.md`, The type checker (the per-key fixture table is held by the checker) and The unit suite.
- `handbook/specs/conventions.md`, How a spec is written (prescriptive, `Issue #N` in prose, no phase names or other volatile state) and How code is cited, for the rulebook line, the engine-invariants section and the one code comment; Where a rule lives, for why the section is owed.
- `handbook/specs/settle-doctrine.md` is NOT owed: no e2e wait or probe is written; existing suites are run unchanged.

## The design

1. **A new module, `src/world/terrain-inputs.ts`, owns the subset.** It exports `TERRAIN_INPUT_KEYS`, a readonly tuple of the recipe fields that shape the heightfield (`["coastWarp"]` today), checked by `satisfies` to be keys of both `TerrainParams` (`src/terrain/heightfield.ts`) and `WorldRecipe` (`src/world/types.ts`); `TerrainInputKey`, the tuple's member type; `TerrainInputs`, defined as `Pick<TerrainParams, TerrainInputKey>`, so the type follows the tuple and adding a key is one edit; and `terrainInputsOf(source: TerrainInputs): TerrainInputs`, which copies each key of the tuple whose value is defined, in tuple order, and leaves an absent one absent (never a key holding `undefined`).
2. **Every caller takes the subset from `terrainInputsOf` and spreads it whole.** `terrainStage` spreads `terrainInputsOf(recipe)` into its `buildHeightfield` call in place of the conditional spread. `regionElevation` computes `terrainInputsOf(recipe)` once and spreads it into BOTH the bare arm's `buildHeightfield` call and the `ChainSpec` it hands `buildChainedField`. `buildChainedField` spreads `terrainInputsOf(spec)` into its own `buildHeightfield` call in place of its conditional spread; its recursion already copies the spec whole (`{ ...spec, window: w, ...gridForWindow(w) }`), so every ancestor inherits the inputs and that line does not change.
3. **`ChainSpec` becomes `TerrainInputs & { ...the seven required fields as today }`**, flat, so `specFor(win, { coastWarp: 1 })` in `test/world/detail-chain.test.ts` stays as it is, as the issue requires.
4. **`chainCacheKey` keys the subset generically, in tuple order**: its last element `spec.coastWarp ?? "-"` becomes `...TERRAIN_INPUT_KEYS.map((key) => spec[key] ?? "-")`. With one key the key string is byte-identical to today's, so the Explorer's held chain cache behaves exactly as before for every spec it already sees.
5. **No world sheet moves.** `terrainInputsOf(recipe)` yields `{ coastWarp }` exactly when the old conditional spread did and `{}` otherwise, so `terrainStage` passes the same values; the golden and the committed charts stand still by construction, and the guards confirm it (Evidence).
6. **What moves is ruled accepted (D2)**: every close-up of a world whose recipe carries a coast warp other than its type's default 0.55, in the Explorer's Glass (detailed arm, `src/site/explorer/worker.ts` and `src/site/explorer/worker-client.ts`) and in a bound atlas's regional plates (bare arm, `regionPlates` in `src/atlas/compose.ts`). A recipe with no coast warp, or with 0.55 written out, draws the identical close-up as today (Evidence measures both digests).

### Rejected

- **An explicit conditional spread per field inside `terrainInputsOf`, with a separately written key list.** Two lists to keep in step; a field written into one and not the other compiles. The tuple-derived type makes the key list, the type and the copy one thing.
- **A nested `ChainSpec` (`{ ...core, terrain: TerrainInputs }`).** Cleaner forwarding, but it rewrites `specFor`'s `{ coastWarp: 1 }` and every other `ChainSpec` construction (tests and `scripts/region-detail/*`), and the issue requires the existing coast-warp key assertion to stay as it is.
- **Rest destructuring in `buildChainedField` and `chainCacheKey` (everything after the seven core fields is the subset).** No key list needed, but any stray property on a spec object would be forwarded to `buildHeightfield` and keyed, silently; the tuple names exactly what is forwarded.
- **A second function for the chain's forward (`pickTerrainInputs(spec)`) beside `terrainInputsOf(recipe)`.** Today every terrain input has the same name and meaning in the recipe and in `TerrainParams`, so one pick serves both; a later field whose recipe form differs from its terrain form is that sub's design to make.
- **A test that the close-up's digest differs across coast values.** The detailed arm already passes it today, because `seaLevel` is in the key (the issue says so), and a forward-spread omission would still pass it.
- **A test-side copy of the key list compared to `TERRAIN_INPUT_KEYS` at run time.** The test imports the exported tuple and walks it (`vellum-footguns` Gate 1 item 16); the per-key fixture table is typed `Record<TerrainInputKey, ...>`, so the type checker refuses a key with no fixture, the cheaper instrument (`handbook/specs/check-placement.md`), and the run time walk would throw on one anyway.
- **Issue #453's band-1 window alone.** Its chain has one ancestor, the full window, so an input dropped only by the ancestors reads 3.47% there at coast 0.1, under the bound; a band-3 window, three ancestors deep, reads 8.82% and 13.26% (M7). The band-3 window costs about 4.4 s more on both arms.
- **The band-3 window on the detailed arm only.** About 2 s cheaper, but the bare arm then has one window and the loop needs a per-window arm list; one uniform loop over windows and arms is the plainer test.
- **Editing `scripts/region-detail/*` to use the mapper.** They are the measurement tools of Issues #396 to #398, build every world from `defaultRecipe(seed)` with no terrain input, and `partition.ts` deliberately rebuilds the pre-chain arm; the mapper would add nothing there and would change what they measured.

## Files

| file | change |
|---|---|
| `handbook/plans/850/850-plan.md` | created: this plan, copied unchanged from the scratchpad, in the first commit |
| `src/world/terrain-inputs.ts` | created, exactly as below (about 20 lines) |
| `test/world/terrain-inputs.test.ts` | created, exactly as below (about 85 lines) |
| `src/world/generate.ts` | edited: one import, `terrainStage`'s `buildHeightfield` call |
| `src/world/region.ts` | edited: one import, `regionElevation` |
| `src/world/detail-chain.ts` | edited: one import, `ChainSpec`, the last element of `chainCacheKey`, the spread in `buildChainedField` |
| `handbook/specs/rulebook.md` | edited: one new bullet under Scheduling rules |
| `handbook/specs/engine-invariants.md` | edited: one new section |

Nothing else changes: no file under `src/site/`, `src/atlas/`, `src/render/`, `e2e/`, `scripts/` or `test-support/`; no committed chart; `src/site/explorer/region-chain-cache.ts`'s comment ("Both sliders move seaLevel, which is in chainCacheKey") stays true and is not edited.

### `src/world/terrain-inputs.ts` (new), exactly

```ts
import type { TerrainParams } from "../terrain/heightfield.ts";
import type { WorldRecipe } from "./types.ts";

// A recipe field that shapes the heightfield joins this list, and reaches the world sheet, both close-up arms and the detail chain from here alone (Issue #453).
export const TERRAIN_INPUT_KEYS = ["coastWarp"] as const satisfies ReadonlyArray<keyof TerrainParams & keyof WorldRecipe>;

export type TerrainInputKey = (typeof TERRAIN_INPUT_KEYS)[number];

export type TerrainInputs = Pick<TerrainParams, TerrainInputKey>;

export function terrainInputsOf(source: TerrainInputs): TerrainInputs {
  const picked: Partial<Record<TerrainInputKey, unknown>> = {};
  for (const key of TERRAIN_INPUT_KEYS) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked as TerrainInputs;
}
```

The planner type-checked this module and its three uses (a recipe, a `ChainSpec` built with it, a `buildHeightfield` call spreading it, and the test's `Record<TerrainInputKey, ...>` table) under the repo's `tsconfig.json`: exit 0 (`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/850-typeprobe/probe.ts`). With `"featureScale"` added to the tuple, the checker refuses it (not a key of `WorldRecipe`) AND refuses the fixture table (`Property 'featureScale' is missing`) (`probe2.ts` there).

### `src/world/generate.ts` (lines as at d5d46bcc)

- After line 22 (`import type { FeatureNames, NamedSettlement, Winds, World, WorldRecipe } from "./types.ts";`) add `import { terrainInputsOf } from "./terrain-inputs.ts";`.
- Lines 79 to 85,

```ts
  const elev = buildHeightfield({
    seed,
    gridW,
    gridH,
    mapType,
    ...(recipe.coastWarp !== undefined ? { coastWarp: recipe.coastWarp } : {}),
  });
```

  become

```ts
  const elev = buildHeightfield({ seed, gridW, gridH, mapType, ...terrainInputsOf(recipe) });
```

### `src/world/region.ts` (lines as at d5d46bcc)

- After line 12 (`import { buildChainedField, detailForWindow, type ChainCache } from "./detail-chain.ts";`) add `import { terrainInputsOf } from "./terrain-inputs.ts";`.
- `regionElevation`, lines 42 to 66, becomes

```ts
function regionElevation(g: RegionGrid, spec: RegionSpec, seaLevel: number): Field {
  const { world, window, gridW, gridH, worldAspect } = g;
  const { recipe } = world;
  const terrain = terrainInputsOf(recipe);
  return spec.detail === true
    ? buildChainedField(
        {
          seed: recipe.seed,
          mapType: recipe.mapType,
          window,
          gridW,
          gridH,
          worldAspect,
          seaLevel,
          ...terrain,
        },
        spec.chainCache,
      )
    : buildHeightfield({
        seed: recipe.seed,
        gridW,
        gridH,
        mapType: recipe.mapType,
        window,
        worldAspect,
        ...terrain,
      });
}
```

### `src/world/detail-chain.ts` (lines as at d5d46bcc)

- After line 10 (`import { FULL_WINDOW, LOD_BANDS, lodWindowFor, quantizeCenter } from "./lod.ts";`) add `import { TERRAIN_INPUT_KEYS, terrainInputsOf, type TerrainInputs } from "./terrain-inputs.ts";`.
- Lines 13 to 22: `export type ChainSpec = {` becomes `export type ChainSpec = TerrainInputs & {`, and line 21 (`  readonly coastWarp?: number;`) is deleted. The doc comment on line 12 and the seven other fields are unchanged.
- Line 72, `    spec.coastWarp ?? "-",`, becomes `    ...TERRAIN_INPUT_KEYS.map((key) => spec[key] ?? "-"),`.
- Line 143, `    ...(spec.coastWarp !== undefined ? { coastWarp: spec.coastWarp } : {}),`, becomes `    ...terrainInputsOf(spec),`.

Run `npm run format` after the edits and keep what it writes.

### `test/world/terrain-inputs.test.ts` (new), exactly

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { chainCacheKey, type ChainSpec } from "../../src/world/detail-chain.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { TERRAIN_INPUT_KEYS, type TerrainInputKey, type TerrainInputs } from "../../src/world/terrain-inputs.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";

const SEED = 2;
const BAND_1 = lodWindowFor(0.5625, 0.4375, 0.5);
const BAND_3 = lodWindowFor(0.25, 0.5, 0.125);
const WINDOWS = [BAND_1, BAND_3];
// 2026-10-21, Issue #850: swept seeds 1 to 12 and 42, band 1 to 3 windows and the atlas's 0.38 window, coast absent, 0, 0.1, 0.3, 0.8, 0.9 and 1, both arms passed every input: worst 3.08% (seed 5, band 3, coast 0.1, bare), so 4% keeps 0.92 points of headroom.
const BOUND = 0.04;

const OFF_DEFAULT: Readonly<Record<TerrainInputKey, ReadonlyArray<TerrainInputs>>> = {
  coastWarp: [{ coastWarp: 0.1 }, { coastWarp: 0.9 }],
};

const ARMS = [
  { name: "bare", detail: false },
  { name: "detailed", detail: true },
] as const;

const pct = (fraction: number): string => `${(100 * fraction).toFixed(2)}%`;

function closeUp(world: World, window: UvWindow, detail: boolean): World {
  return generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "The Environs", detail });
}

function disagreement(chart: World, close: World, window: UvWindow): number {
  const { gridW, gridH } = close.recipe;
  const { gridW: W, gridH: H } = chart.recipe;
  let cells = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const u = window.u0 + (gx / (gridW - 1)) * (window.u1 - window.u0);
      const v = window.v0 + (gy / (gridH - 1)) * (window.v1 - window.v0);
      const chartLand = chart.elev.at(Math.round(u * (W - 1)), Math.round(v * (H - 1))) > chart.seaLevel;
      if (chartLand !== close.elev.at(gx, gy) > close.seaLevel) cells++;
    }
  }
  return cells / (gridW * gridH);
}

test("a close-up agrees with its own chart for every terrain input off its default, on the bare arm and the detailed arm (Issue #453, Issue #850)", () => {
  const plain = generateWorld(defaultRecipe(SEED));
  const charts = TERRAIN_INPUT_KEYS.flatMap((key) =>
    OFF_DEFAULT[key].map((inputs) => ({ key, inputs, world: generateWorld(defaultRecipe(SEED, inputs)) })),
  );
  const problems: string[] = [];
  for (const window of WINDOWS) {
    for (const arm of ARMS) {
      const ignoring = closeUp(plain, window, arm.detail);
      for (const chart of charts) {
        const label = `${chart.key} ${JSON.stringify(chart.inputs)} on the ${arm.name} arm, window size ${window.u1 - window.u0}`;
        const blind = disagreement(chart.world, ignoring, window);
        assert.ok(blind > BOUND, `${label}: a close-up that ignored the input disagrees by only ${pct(blind)}, so this fixture cannot see an input dropped`);
        const drawn = disagreement(chart.world, closeUp(chart.world, window, arm.detail), window);
        if (drawn > BOUND) problems.push(`${label}: ${pct(drawn)} of cells disagree with the chart, over the ${pct(BOUND)} bound`);
      }
    }
  }
  assert.deepEqual(problems, [], "a close-up drew land or sea its own chart does not");
});

test("two chain specs that differ only in one terrain input never share a cache key (Issue #850)", () => {
  const base: ChainSpec = {
    seed: SEED,
    mapType: "archipelago",
    window: BAND_1,
    gridW: 320,
    gridH: 240,
    worldAspect: 319 / 239,
    seaLevel: 0.46,
  };
  for (const key of TERRAIN_INPUT_KEYS) {
    const keys = [base, ...OFF_DEFAULT[key].map((inputs) => ({ ...base, ...inputs }))].map(chainCacheKey);
    assert.equal(new Set(keys).size, keys.length, `${key}: ${keys.length} specs share ${new Set(keys).size} cache keys`);
  }
});
```

Run `npm run format` and keep what it writes. The test reads no repo file, so `test-support/source-read-list.ts` is untouched; both callbacks are under the 50-line `max-lines-per-function`.

Measured by the planner: the module and this test file, extracted verbatim from this plan into the planner's tree as a throwaway (removed afterwards; `git status --porcelain` clean), pass `eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` (exit 0), and at the commit-1 state `node --import ./test-support/source-read-guard.ts --test test/world/terrain-inputs.test.ts` printed test 2 passing and test 1 failing on exactly the eight problems named under Tests, in this order, in 9.01 s.

### `handbook/specs/rulebook.md`

Under `## Scheduling rules`, after the bullet that begins `- **#401 (The Chart Table) HAS ITS SLOT, ratified 2026-09-05**` (it ends `... under the Explorer.`) and before the bullet that begins `- Each epic carries its own contract`, insert exactly:

```
- **Issue #844 (Shape and count) HAS ITS SLOT, ratified 2026-10-10**, with its own board phase and
  label. Its founding words are part of version 1 of the founding: they land before Issue #393 makes
  the written-world link public and locks that version, and Issue #393 stays held until they have.
  What the epic carries past the lock is version 2 of the word list. Sub 0 (Issue #849) was the
  design sitting and gated the rest.
```

The two existing slot bullets are not edited (their bare `#395` and `#401` stay as written; conventions.md trims a bare number only where a line is touched).

### `handbook/specs/engine-invariants.md`

Immediately before the heading line `## World identity is entry-point independent` (so the new section closes out `## Identity versus view`'s neighbourhood and comes before the entry-point section), insert exactly, followed by one blank line:

```
## A terrain input reaches every sheet through one mapper

**A recipe field that shapes the heightfield is a terrain input, and it is read in one place.** Add
it to `TERRAIN_INPUT_KEYS` in `src/world/terrain-inputs.ts`; `terrainInputsOf` there hands it to the
world sheet (`terrainStage` in `src/world/generate.ts`), to both arms of a close-up
(`regionElevation` in `src/world/region.ts`) and to the detail chain and its cache key
(`buildChainedField` and `chainCacheKey` in `src/world/detail-chain.ts`). Never pass one to
`buildHeightfield` by hand: a field spread at one call and forgotten at another draws a close-up that
contradicts its own chart. `test/world/terrain-inputs.test.ts` walks every key of the list and holds
each arm of the close-up to its chart; it cannot see a field that never joined the list.
```

## Tests, in the order they are written

Both live in `test/world/terrain-inputs.test.ts`, written in commit 1 with the module, before any call site changes.

1. **`a close-up agrees with its own chart for every terrain input off its default, on the bare arm and the detailed arm (Issue #453, Issue #850)`.**
   - Assertion: for every key of `TERRAIN_INPUT_KEYS` and every override in its `OFF_DEFAULT` row, on two windows (`BAND_1`, Issue #453's own band-1 window, whose chain has one ancestor; `BAND_3`, a band-3 window at (0.25, 0.5), whose chain has three) and on each arm, the share of the close-up's cells whose land or sea disagrees with the chart's nearest cell is at most `BOUND`; all failures are collected and reported together. Before it, the witness: the same chart against the PLAIN world's close-up on that window and arm disagrees by more than `BOUND`, so the fixture can see a dropped input (`vellum-footguns` Gate 1 item 2), asserted through the top-level API at non-default values (Gate 1 item 3).
   - Red at commit 1, with `src/world/terrain-inputs.ts` complete and no call site changed, on the `deepEqual` message `a close-up drew land or sea its own chart does not`, listing eight problems in this order (measured by `850-probe-test2.ts`; the implementer pastes what prints): window size 0.5, bare arm, 0.1 at 6.11% and 0.9 at 5.40%; window size 0.5, detailed arm, 5.89% and 5.36%; window size 0.125, bare arm, 9.53% and 12.94%; window size 0.125, detailed arm, 9.05% and 13.53%. The witness passes at commit 1 (measured, in the same order: 6.15%, 5.47%, 6.11%, 5.43%, 9.27%, 13.11%, 8.70%, 13.84%, each over the 4.00% bound). That is "the right shape, the wrong behavior": the module exists and is imported, the close-up does not yet use it. The test body takes about 9.2 s (measured 9.20 s).
   - Green at commit 2. The passed-through values it must then read are at most 2.18% (`850-probe.ts`: band 1 1.72%, 1.62%, 1.45%, 1.43%; band 3 2.18%, 1.98%, 1.82%, 1.83%).
   - Mutations once green, each one line (by line, never by text), each owed to `vellum-guard-prover` with this test named:
     - M1: in `regionElevation`, delete the `...terrain,` line of the bare arm's `buildHeightfield` call. Reds on the bare arm's four problems.
     - M2: in `regionElevation`, delete the `...terrain,` line of the `ChainSpec`. Reds on the detailed arm's four problems.
     - M3: in `buildChainedField`, delete the `...terrainInputsOf(spec),` line (the forward spread). Every level of the chain then builds without the input while the key still carries it, which draws exactly today's detailed close-up; reds on the detailed arm's four problems.
     - M7: in `buildChainedField`, replace the line `    const fields = ancestors.map((w) => buildChainedField({ ...spec, window: w, ...gridForWindow(w) }, cache));` with `    const fields = ancestors.map((w) => buildChainedField({ seed: spec.seed, mapType: spec.mapType, worldAspect: spec.worldAspect, seaLevel: spec.seaLevel, window: w, ...gridForWindow(w) }, cache));` (the ancestors drop the input, the target keeps it). Reds on three detailed problems: band 3 at 8.82% and 13.26%, band 1 at 0.9 at 4.96%; band 1 at 0.1 reads 3.47%, under the bound, which is why `BAND_3` is in the fixture (measured by `850-probe-test2.ts`, which reproduces the plan skeptic's figures).
     - M5: in `terrainInputsOf`, delete the line `if (source[key] !== undefined) picked[key] = source[key];`. The world sheet then ignores the input, the chart equals the plain one, and the WITNESS reds (`a close-up that ignored the input disagrees by only 1.73%`). Other suites may red as well; the prover names them.
     - M6: in `terrainStage`, replace the line `  const elev = buildHeightfield({ seed, gridW, gridH, mapType, ...terrainInputsOf(recipe) });` with `  const elev = buildHeightfield({ seed, gridW, gridH, mapType });` (the import then goes unused; the unit suite still runs). The witness reds the same way.
2. **`two chain specs that differ only in one terrain input never share a cache key (Issue #850)`.**
   - Assertion: for every key, the base spec with the key absent and with each `OFF_DEFAULT` value give pairwise distinct `chainCacheKey` strings.
   - GREEN at commit 1, and this is expected, not a stop condition: today's key already ends in `spec.coastWarp ?? "-"`. It is written now so the generic key is held for every key Subs 2 and 3 add. Its proof is a mutation, not a red-first.
   - Mutation once green, owed to `vellum-guard-prover`: M4: in `chainCacheKey`, delete the `...TERRAIN_INPUT_KEYS.map((key) => spec[key] ?? "-"),` line. Reds this test (`coastWarp: 3 specs share 1 cache keys`) and the existing `a different coast warp shares one cache key` assertion in `test/world/detail-chain.test.ts`.
3. **The per-key fixture table is held by the type checker, not by a test.** A key added to `TERRAIN_INPUT_KEYS` without an `OFF_DEFAULT` row fails `npm run check`. The prover runs unit tests only, so the implementer proves this once by hand after commit 2: add `"featureScale"` to the tuple, run `npm run check`, confirm it reds at the tuple (not a key of `WorldRecipe`) and at `OFF_DEFAULT` (`Property 'featureScale' is missing`), restore, and name it in the PR body as proven by the implementing session. Commit before mutating.

Not written: a digest-differs test (Rejected), and a unit test of `terrainInputsOf` alone (its only outcomes are what the sheets draw, which test 1 reads).

## Order of commits

1. `#850 A close-up is held to its own chart for every terrain input, on both arms (red)`: `handbook/plans/850/850-plan.md`, `src/world/terrain-inputs.ts`, `test/world/terrain-inputs.test.ts`. `node --import ./test-support/source-read-guard.ts --test test/world/terrain-inputs.test.ts` reds test 1 on the message above and passes test 2. Push.
2. `#850 One mapper hands every terrain input to the world sheet, both close-up arms and the detail chain`: `src/world/generate.ts`, `src/world/region.ts`, `src/world/detail-chain.ts`. Everything green.
3. `#850 The rulebook seats Shape and count, and the engine spec names the one terrain mapper`: `handbook/specs/rulebook.md`, `handbook/specs/engine-invariants.md`. `test/repo/prose-paths.test.ts` must pass: the new section's backticked paths exist by then.

The PR body carries two closing lines, `Closes #850` and `Closes #453`, each on its own line (one keyword per reference, `vellum-footguns` Gate 5 item 5); `gh pr view <N> --json closingIssuesReferences` must list both.

## Rosters and doctrine

- Joins no roster. `git grep -n -e "detail-chain\.ts" -e "world/region\.ts"` outside `src/` and `test/` finds only `scripts/region-detail/*` imports; no list, budget, tsconfig `files` entry or lint block names the world modules (`tsconfig.engine.json` includes `src/**/*.ts`; `tsconfig.worker.json` follows imports from `src/site/explorer/worker.ts`).
- Contradicts no spec line: `grep -rn -i -e "coast warp" -e coastWarp -e "#453" -e chainCacheKey -e ChainSpec -e regionElevation handbook/specs .claude CLAUDE.md` finds only the rulebook's stamp bullet (the absent `coastWarp` parse, unchanged) and engine-invariants' border-test sentence (unchanged).
- `src/site/explorer/region-chain-cache.ts`'s header line stays true (the coast slider still moves `seaLevel`, and now also moves the key directly); not edited.
- `scripts/region-detail/{cost,partition,probes}.ts` build `ChainSpec` without terrain inputs and keep compiling, since the subset's fields are optional; not edited (Rejected).
- The slot line and the engine-invariants section are written out above. A new section joins no reading list (it is a section of an existing spec, not a new spec file), and nothing pins the spec's headings or their order: `git grep -n -e "World identity is entry-point independent" -e "Identity versus view" -- test scripts .claude e2e src test-support` finds nothing, and the only code that cites the spec by section is `scripts/lint/import-bounds.ts` (", Founding a world from a sentence"), a section this change does not touch.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- The golden and the committed charts: `test/world/golden-seed42.test.ts`, `test/world/covenant-seed42.test.ts` and `test/site/hero-charts.test.ts` green inside `npm test`; `git status --porcelain src/static` prints nothing after `npm test`; no `npm run charts:regen`, no `npm run og`. Say "no regen owed" in the body with these commands named (`vellum-footguns` Gate 6 item 7).
- Before and after, through the real entry points: `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/850-evidence.ts <worktree root> <worktree root>/out/850 before` at commit 1, and the same with `after` at commit 2. It prints a table (test 1's two windows; coast absent, 0.55, 0.1, 0.9; both arms; terrain digest and disagreement) and writes the chart and the band-1 detailed close-up at coast 0.1 as SVGs. The planner ran "before" at d5d46bcc (`850-evidence-out/before-table.md` in the scratchpad):
  - band 1 (size 0.5 at (0.3125, 0.1875)): absent and 0.55, bare `c453639d9bdc` 1326 (1.73%), detailed `29649d38b74d` 1143 (1.49%); 0.1, bare `c453639d9bdc` 4696 (6.11%), detailed `74ba3f6f9a12` 4526 (5.89%); 0.9, bare `c453639d9bdc` 4148 (5.40%), detailed `410afac933b3` 4119 (5.36%).
  - band 3 (size 0.125 at (0.1875, 0.4375)): absent and 0.55, bare `f4c85f27d059` 1907 (2.48%), detailed `ba3dd6cf5ee6` 1938 (2.52%); 0.1, bare `f4c85f27d059` 7319 (9.53%), detailed `5d86eda45329` 6954 (9.05%); 0.9, bare `f4c85f27d059` 9939 (12.94%), detailed `4c5631f6cec1` 10390 (13.53%).

  Expected "after", exactly (digests from `850-probe-after-digests.ts`, counts from `850-probe.ts`):
  - the absent and 0.55 rows on both windows unchanged, digests included;
  - band 1: 0.1, bare `ea6dde086299` 1320 (1.72%), detailed `54ed8a9656cb` 1116 (1.45%); 0.9, bare `df6bd4f79488` 1246 (1.62%), detailed `63499a453177` 1101 (1.43%);
  - band 3: 0.1, bare `94e97b6cac00` 1673 (2.18%), detailed `1e4bdccd99bc` 1397 (1.82%); 0.9, bare `12d67dca416c` 1521 (1.98%), detailed `66b6be5b9f17` 1409 (1.83%).

  Paste both tables in the PR body.
- The stills for Alex: in `<worktree root>/out/850/`, write `notes.md` opening with `# Issue #850: the close-up now follows the coast slider`, saying to compare `before-closeup-coast-10.svg` and `after-closeup-coast-10.svg` against `after-chart-coast-10.svg` (the chart is the same before and after), then run `npm run delivery -- out/850` from the worktree root. Report the folder's absolute path for the dispatcher to copy across.
- e2e, the suites that draw through the worker this change touches, never the full lanes: `npm run build`, then `VELLUM_E2E_SUITES=render,zoom,document-rooms,region-detail npm run test:e2e` (canonical order keeps `region-detail` straight after its predecessor `document-rooms`). `render` holds the browser's world sheet to the committed chart (R4); `zoom` and `region-detail` draw close-ups through the worker at the default coast, which must be unchanged.
- `vellum-guard-prover`: owed on tests 1 and 2 with M1 to M7. `vellum-plate-reader`: NOT owed; no appearance is decided, and the measurement is test 1's.
- Test 1's cost: about 9.2 s on one unit shard, against the shard cap of 9 minutes whose worst measured job is 4m46s (`timeout-minutes: 9` and the dated line above it in `.github/workflows/ci.yml`).

## Calls made

1. **The mapper is a pick over an exported key tuple, and the type is derived from the tuple.** Rule: the issue's "add a field by adding it to the mapper and the subset's type, one edit"; `handbook/specs/check-placement.md` (make a wrong state unrepresentable before testing it).
2. **The names are the issue's working names: `terrainInputsOf` in `src/world/terrain-inputs.ts`.** Rule: Issues #851 and #852 already cite both by name.
3. **One function serves the recipe and the chain's forward.** Rule: every terrain input today has one name and meaning in `WorldRecipe` and `TerrainParams` (the tuple's `satisfies` checks both); the boring solution.
4. **`ChainSpec` stays flat, and the key string stays byte-identical for today's one key.** Rule: the issue keeps the existing coast-warp key assertion as it is; nothing in the Explorer's held cache changes for a spec it already sees.
5. **The fixture is seed 2 at coast 0.1 and 0.9, on Issue #453's band-1 window and a band-3 window, on both arms, and the bound is an absolute share of cells.** Rule: `CLAUDE.md` (a bound is derived; sweep first, set above the worst case with the headroom named); the issue's own seed, window and values; the off-lattice atlas window is in the sweep, not in the test, since the bare arm's mechanism does not change with the window. The bound is 4%, above the sweep's worst passed-through row (3.08%) by 0.92 points and below the fixture's smallest broken row (5.36%) by 1.36 points. It is absolute rather than relative to the same window's default floor because the worst excess over that floor is itself 1.25 points bare and 1.41 detailed (so a relative bound needs a fitted margin too), it would cost two more close-ups per run, and a later input that legitimately lengthens the coastline (an outline) raises the floor in a way a relative bound would read as a defect. The bound is taken over every window kind swept, not band 1 alone (whose worst is 1.73%), so a later sub may move the fixture without re-deriving it.
6. **The witness is the plain world's close-up on the same window and arm.** On the bare arm that is exactly what a close-up that ignored the input draws; on the detailed arm it is close to it, since a dropped-input close-up still takes the chart's own sea level into the chain (5.89% and 5.36% at band 1 against the witness's 6.11% and 5.43%), so the detailed arm's true band-1 margin over the bound is 1.36 points, not 1.43. Rule: Gate 1 item 2.
7. **Test 2 is green at birth.** Rule: the key already carries the coast warp; the test exists for the keys Subs 2 and 3 add, and its proof is M4.
8. **One code comment, at `TERRAIN_INPUT_KEYS`.** Rule: the comment doctrine's carve-out; no test can see a terrain field that bypasses the list.
9. **The slot line's wording**, written out above: no phase name, label name or sub roster (conventions.md, volatile state); `Issue #844` rather than a bare number; the version-1 placement from comments 6097579255 and 6281800234, limited to the epic's founding words, because comment 6281871579 (2026-10-20) made Issue #393 itself and Issue #848, the version 2 that follows the lock, subs of this epic; and Sub 0 as the gate, in the Issue #401 line's form. The rulebook's rule reads that a slot "is ratified in this file before any sub is drafted", and the subs were filed before the line was written; what authorizes writing it now is comment 6097758352 item 1, which ruled that the epic's first pull request records it.
10. **Two closing lines, `Closes #850` and `Closes #453`.** Rule: the issue's acceptance names Issue #453; this pull request is Issue #850's.
11. **`scripts/region-detail/*` and `src/site/explorer/region-chain-cache.ts` are not touched.** Rule: touch only what the issue needs; both stay correct as written.
12. **Before and after stills go to `out/850/` with no plate reader.** Rule: Alex looks at visual work (`CLAUDE.md`, Write visual samples to out/); nothing is ruled from them, so no plate read is owed.
13. **e2e: `render`, `zoom`, `document-rooms`, `region-detail`.** Rule: the suites that draw a world or a close-up through the worker this change edits.
14. **Merge order:** no open pull request touches this issue's files (`gh pr list -R ahl-gram/Vellum --state open` at the second draft: none; PR #948 merged in the meantime and touched docs only). Issues #851 and #852 build on this module and come after it; Epic Issue #395's river, road and town-placement subs, which may edit `src/world/region.ts`, follow this one.
15. **The one-mapper rule is written into `handbook/specs/engine-invariants.md`, as a new section before `## World identity is entry-point independent`.** Rule: `handbook/specs/conventions.md`, Where a rule lives: anything Vellum-specific, normative and slow-changing is a spec, and "a terrain input reaches every sheet only through `terrainInputsOf`" is all three, so leaving it in a code comment alone is a home the routing rule refuses; engine-invariants is the spec owed before any change to world generation, which is where Subs 2 and 3 begin, and it owns this rule rather than `handbook/specs/region-and-voyage.md` (whose footer takes "every rule about a FINER view") because the rule binds `terrainStage`, the world sheet's own generation, before it binds any close-up. This is the one file the issue's Files list does not name. The code comment at `TERRAIN_INPUT_KEYS` stays (the same section: a code comment is not a second copy). This was the draft's D1; the plan skeptic showed the routing rule already answers it.
16. **The issue's "test-side list that must equal them" is replaced by the exported tuple plus a fixture table the type checker holds** (`Readonly<Record<TerrainInputKey, ...>>`). A named departure from the issue body's Approach item 1. Rule: `handbook/specs/check-placement.md` (the cheapest instrument that can see the rule; make the wrong state unrepresentable) and `vellum-footguns` Gate 1 item 16 (a roster a guard checks is exported data the guard imports). The issue's intent holds: a key added to the tuple without a fixture reds `npm run check` (Tests, item 3), and every key in the tuple is walked.
17. **Test 1 adds a band-3 window to Issue #453's band-1 window, on both arms.** Rule: `vellum-footguns` Gate 1 item 6 (guard the class): the recursion that hands the inputs to the ancestors is a sixth place an input can be dropped, and the band-1 window, one ancestor deep, sees that drop at only one of its two values (M7). Cost about 4.4 s.

## Open decisions

None. The plan still stops here so Alex sees the calls above before anything is built.

## Stop conditions (hand back, do not adapt)

- `git diff --stat cbf57b8f01c6e83adfebfc2540d6cbdb9af20815 origin/main -- src/world/generate.ts src/world/region.ts src/world/detail-chain.ts src/world/types.ts src/terrain/heightfield.ts test/world/detail-chain.test.ts src/site/explorer/worker.ts src/site/explorer/worker-client.ts src/atlas/compose.ts` prints anything, or `src/world/terrain-inputs.ts` or `test/world/terrain-inputs.test.ts` already exists on `origin/main`.
- A line this plan quotes "as at d5d46bcc" is not at the number given, or reads differently.
- At commit 1, test 1 reds on anything but the `deepEqual` message with exactly the eight problems named (the witness must pass), or test 2 reds; or any other test file reds.
- At commit 2, `node --test` reports test 1 taking more than 20 s (planned about 9.2 s).
- At commit 2, any test reds, most of all `test/world/golden-seed42.test.ts`, `test/world/covenant-seed42.test.ts`, `test/site/hero-charts.test.ts` or `test/world/detail-chain.test.ts`; or `git status --porcelain src/static` prints anything.
- `npm run check` reds anywhere, `scripts/region-detail/*` included; or `npm run lint` reds on the new module's `as TerrainInputs` assertion or anything else in the files above.
- The evidence script's "before" table at commit 1 differs from the planner's "before" values above in any cell, or its "after" table at commit 2 differs from the expected "after" values in any cell (counts and digests are exact: same machine class, same code path; a mismatch means the build is not the plan's).
- Any of `render`, `zoom`, `document-rooms`, `region-detail` reds.
- `vellum-guard-prover` reports M1, M2, M3, M4, M5, M6 or M7 as a hole.

## The plan skeptic's findings, and what became of each

`vellum-plan-skeptic` read the first draft cold with the recon ledger (2026-10-21): nothing blocking, four should-fix, two nits.

1. **The slot line said the whole epic lands before Issue #393, though comment 6281871579 made Issue #393 and Issue #848 subs of the epic.** Folded: the line now limits the version-1 placement to the epic's founding words and says what follows the lock is version 2; Calls made 9 cites 6281871579 and names comment 6097758352 item 1 as what authorizes writing the line now, dropping the draft's argument that the "before any sub is drafted" rule was met.
2. **Nothing guarded the chain's recursion, and the band-1 fixture saw an ancestors-only drop at one value of two.** Folded: test 1 adds a band-3 window on both arms, and M7 joins the prover's list (measured: 8.82% and 13.26% at band 3).
3. **The routing rule already answers D1.** Folded: the engine-invariants section is a call (Calls made 15), and the menu is empty.
4. **The departure from the issue's "test-side list" was buried in Rejected.** Folded: Calls made 16.
5. **The witness is exact for the bare arm only.** Folded: Calls made 6 says so and gives the detailed arm's true margin.
6. **Test 1's cost was never set against a budget.** Folded: one line in Evidence.
