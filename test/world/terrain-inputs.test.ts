import { test } from "node:test";
import assert from "node:assert/strict";
import { chainCacheKey, type ChainSpec } from "../../src/world/detail-chain.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { TERRAIN_INPUT_KEYS, type TerrainInputKey, type TerrainInputs } from "../../src/world/terrain-inputs.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { OUTLINE_IDS } from "../../src/world/outline-ids.ts";
import type { World } from "../../src/world/types.ts";

const SEED = 2;
const BAND_1 = lodWindowFor(0.5625, 0.4375, 0.5);
const BAND_3 = lodWindowFor(0.25, 0.5, 0.125);
const WINDOWS = [BAND_1, BAND_3];
// 2026-10-21, Issue #850: swept seeds 1 to 12 and 42, band 1 to 3 windows and the atlas's 0.38 window, coast absent, 0, 0.1, 0.3, 0.8, 0.9 and 1, both arms passed every input: worst 3.08% (seed 5, band 3, coast 0.1, bare), so 4% keeps 0.92 points of headroom.
const BOUND = 0.04;

const OFF_DEFAULT: Readonly<Record<TerrainInputKey, readonly [TerrainInputs, ...TerrainInputs[]]>> = {
  coastWarp: [{ coastWarp: 0.1 }, { coastWarp: 0.9 }],
  outline: [{ outline: "crescent" }],
  looseness: [{ outline: "round", looseness: 0.5 }],
  islands: [{ islands: 20 }],
  isleSize: [{ islands: 20, isleSize: "varied" }],
  raggedness: [{ islands: 20, raggedness: 1 }],
};

function without(inputs: TerrainInputs, key: TerrainInputKey): TerrainInputs {
  return Object.fromEntries(Object.entries(inputs).filter(([k]) => k !== key));
}

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

test("a close-up agrees with its own chart for every terrain input off its default, on the bare arm and the detailed arm (Issue #453, Issue #850, Issue #851, Issue #852)", () => {
  const charts = TERRAIN_INPUT_KEYS.flatMap((key) =>
    OFF_DEFAULT[key].map((inputs) => ({
      key,
      inputs,
      world: generateWorld(defaultRecipe(SEED, inputs)),
      blind: generateWorld(defaultRecipe(SEED, without(inputs, key))),
    })),
  );
  const problems: string[] = [];
  for (const window of WINDOWS) {
    for (const arm of ARMS) {
      for (const chart of charts) {
        const label = `${chart.key} ${JSON.stringify(chart.inputs)} on the ${arm.name} arm, window size ${window.u1 - window.u0}`;
        const blind = disagreement(chart.world, closeUp(chart.blind, window, arm.detail), window);
        assert.ok(
          blind > BOUND,
          `${label}: a close-up that ignored the input disagrees by only ${pct(blind)}, so this fixture cannot see an input dropped`,
        );
        const drawn = disagreement(chart.world, closeUp(chart.world, window, arm.detail), window);
        if (drawn > BOUND)
          problems.push(`${label}: ${pct(drawn)} of cells disagree with the chart, over the ${pct(BOUND)} bound`);
      }
    }
  }
  assert.deepEqual(problems, [], "a close-up drew land or sea its own chart does not");
});

const CHAIN_BASE: ChainSpec = {
  seed: SEED,
  mapType: "archipelago",
  window: BAND_1,
  gridW: 320,
  gridH: 240,
  worldAspect: 319 / 239,
  seaLevel: 0.46,
};

test("two chain specs that differ only in one terrain input never share a cache key (Issue #850)", () => {
  for (const key of TERRAIN_INPUT_KEYS) {
    const keys = [CHAIN_BASE, ...OFF_DEFAULT[key].map((inputs) => ({ ...CHAIN_BASE, ...inputs }))].map(chainCacheKey);
    assert.equal(
      new Set(keys).size,
      keys.length,
      `${key}: ${keys.length} specs share ${new Set(keys).size} cache keys`,
    );
  }
});

test("a chain spec's cache key tells every outline apart, and one looseness from another or from none (Issue #851)", () => {
  const specs: ChainSpec[] = [
    ...OUTLINE_IDS.map((outline) => ({ ...CHAIN_BASE, outline })),
    { ...CHAIN_BASE, outline: "round", looseness: 0.5 },
    { ...CHAIN_BASE, outline: "round", looseness: 1 },
  ];
  const keys = specs.map(chainCacheKey);
  assert.equal(new Set(keys).size, keys.length, `${keys.length} specs share ${new Set(keys).size} cache keys`);
});
