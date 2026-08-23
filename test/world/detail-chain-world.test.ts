import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ancestorWindows,
  buildChainedField,
  createChainCache,
  detailForWindow,
  type ChainSpec,
} from "../../src/world/detail-chain.ts";
import type { Field } from "../../src/core/grid.ts";
import { FULL_WINDOW, lodWindowFor } from "../../src/world/lod.ts";
import { buildHeightfield, type UvWindow } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { parentCellsOnWindow } from "../../src/terrain/detail-guarantees.ts";
import {
  parentFusion,
  parentMassesLost,
  parentPartitionOnWindow,
} from "../../test-support/parent-partition.ts";

/** #443's half of the chain's guarantees, measured against the WORLD CHART's own partition rather than against the chain's blurred reference, which is what detail-chain.test.ts pins. Split from that file at #443 to keep both under the 400-line guideline. */

const WORLD_ASPECT = 319 / 239;

// One pinned band-3 window per seed where the world chart's own partition is at stake, from the census on #443: seed 42 (an island map) carries no strait at all, which is why the epic ran this far without seeing it.
const WORLD_FUSION_WINDOWS: ReadonlyArray<readonly [number, number, number]> = [
  [2, 0.75, 0.25],
  [15, 0.375, 0.375],
  [23, 0.5, 0.25],
];

type WorldCase = {
  readonly window: UvWindow;
  readonly partition: Int32Array;
  readonly chained: Field;
  readonly bare: Field;
  readonly sea: number;
};

function worldCase(seed: number, cx: number, cy: number): WorldCase {
  const r = defaultRecipe(seed);
  const chart = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: r.mapType });
  const sea = pickSeaLevel(chart, r.landFraction);
  const window = lodWindowFor(cx, cy, 0.125);
  const spec: ChainSpec = {
    seed,
    mapType: r.mapType,
    window,
    gridW: 320,
    gridH: 240,
    worldAspect: WORLD_ASPECT,
    seaLevel: sea,
  };
  return {
    window,
    partition: parentPartitionOnWindow(chart, FULL_WINDOW, window, 320, 240, sea),
    chained: buildChainedField(spec),
    bare: buildHeightfield({
      seed,
      gridW: 320,
      gridH: 240,
      mapType: r.mapType,
      window,
      worldAspect: WORLD_ASPECT,
      detail: detailForWindow(window),
    }),
    sea,
  };
}

test("the chain never fuses two landmasses of the WORLD CHART, not merely of its own blurred reference (#443)", () => {
  let controlPairs = 0;
  for (const [seed, cx, cy] of WORLD_FUSION_WINDOWS) {
    const c = worldCase(seed, cx, cy);
    // The bare survey of the same window is the control: it is free to bridge, and it does, so a zero on the chained arm is a result rather than a fixture with nothing to join.
    controlPairs += parentFusion(c.bare, c.partition, c.sea).pairs;
    const fused = parentFusion(c.chained, c.partition, c.sea);
    assert.equal(
      fused.pairs,
      0,
      `seed ${seed} window ${cx},${cy}: the chain joined world landmasses ${JSON.stringify(fused.groups)}`,
    );
  }
  // Measured 2026-08-22 on these three windows: the bare arm bridges 4, 5 and 3 pairs.
  assert.ok(controlPairs >= 6, `the bare control barely bridges here (${controlPairs}), so the guard proves nothing`);
});

// NOT an unconditional promise: `node scripts/region-detail-partition.ts` measures 3 world landmasses losing every cell at band 1 and 2 at band 3 on the detail arm, against 1 and 4 on the bare arm, every one a sliver of 4 to 24 region cells out of 76800 clipped at a window edge. What this guard pins is that no landmass with a real footprint in these windows goes.
test("no landmass the world chart draws inside these windows loses all its land (#443)", () => {
  for (const [seed, cx, cy] of WORLD_FUSION_WINDOWS) {
    const c = worldCase(seed, cx, cy);
    const present = new Set(Array.from(c.partition).filter((id) => id >= 0));
    assert.ok(present.size >= 3, `seed ${seed}: only ${present.size} world landmasses reach this window`);
    assert.deepEqual(
      parentMassesLost(c.chained, c.partition, c.sea),
      [],
      `seed ${seed} window ${cx},${cy}: a world landmass lost every one of its cells`,
    );
  }
});

// The lift that stranded five river mouths on #443 came from an ancestor's resampled SURFACE, not from any cell of any ancestor. Cells over an ancestor's own land are excluded: a nearer band is entitled to hold land the world chart does not, and passing it down is the epic's whole point.
test("the chain raises no cell that every ancestor and the survey alike draw as water (#443)", () => {
  for (const [seed, cx, cy] of WORLD_FUSION_WINDOWS) {
    const r = defaultRecipe(seed);
    const c = worldCase(seed, cx, cy);
    const cache = createChainCache();
    const ancestorCells = ancestorWindows(c.window).map((aw) =>
      parentCellsOnWindow(
        buildChainedField(
          { seed, mapType: r.mapType, window: aw, gridW: 320, gridH: 240, worldAspect: WORLD_ASPECT, seaLevel: c.sea },
          cache,
        ),
        aw,
        c.window,
        320,
        240,
      ),
    );
    let candidates = 0;
    let raised = 0;
    for (let i = 0; i < c.chained.data.length; i++) {
      if ((c.bare.data[i] as number) > c.sea) continue;
      if (ancestorCells.some((f) => (f.data[i] as number) > c.sea)) continue;
      candidates++;
      if ((c.chained.data[i] as number) > c.sea) raised++;
    }
    assert.ok(candidates > 10000, `seed ${seed}: only ${candidates} all-water cells checked`);
    assert.equal(raised, 0, `seed ${seed} window ${cx},${cy}: the chain raised ${raised} cells no ancestor charts as land`);
  }
});
