import { test } from "node:test";
import assert from "node:assert/strict";
import type { Field } from "../../src/core/grid.ts";
import { buildHeightfield, type TerrainParams } from "../../src/terrain/heightfield.ts";
import { placeLobes, type IsleSize, type Lobe } from "../../src/terrain/lobes.ts";
import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";

const ASPECT = 319 / 239;
const GRID = { gridW: 320, gridH: 240, mapType: "archipelago" } as const;

const coverage = (lobes: ReadonlyArray<Lobe>): number => lobes.reduce((t, l) => t + l.r * l.r, 0);

function countedMask(seed: number, over: Pick<TerrainParams, "islands" | "isleSize" | "raggedness">): Uint8Array {
  const elev = buildHeightfield({ seed, ...GRID, ...over });
  const recipe = defaultRecipe(seed, { mapType: "archipelago", ...over });
  return landMask(elev, pickSeaLevel(elev, landShareOf(recipe)));
}

function shoreOverLand(mask: Uint8Array, field: Pick<Field, "w" | "h">): number {
  const { w, h } = field;
  let land = 0;
  let shore = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] === 0) continue;
      land++;
      const wet =
        (x > 0 && mask[y * w + x - 1] === 0) ||
        (x < w - 1 && mask[y * w + x + 1] === 0) ||
        (y > 0 && mask[(y - 1) * w + x] === 0) ||
        (y < h - 1 && mask[(y + 1) * w + x] === 0);
      if (wet) shore++;
    }
  }
  return shore / land;
}

function borderLand(mask: Uint8Array): number {
  const { gridW: w, gridH: h } = GRID;
  let cells = 0;
  for (let x = 0; x < w; x++) cells += (mask[x] as number) + (mask[(h - 1) * w + x] as number);
  for (let y = 0; y < h; y++) cells += (mask[y * w] as number) + (mask[y * w + w - 1] as number);
  return cells;
}

function differing(a: Field, b: Field): number {
  let cells = 0;
  for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) cells++;
  return cells;
}

const median = (values: ReadonlyArray<number>): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as number;
};

test("the coast slider draws nothing on a counted world, and the islands' own raggedness does (Issue #852)", () => {
  const counted = { seed: 1, ...GRID, islands: 20 } as const;
  const lowSlider = buildHeightfield({ ...counted, raggedness: 0.5, coastWarp: 0.1 });
  const highSlider = buildHeightfield({ ...counted, raggedness: 0.5, coastWarp: 0.9 });
  assert.equal(differing(lowSlider, highSlider), 0, "cells moved with the coast slider on a counted world");
  const round = buildHeightfield({ ...counted, coastWarp: 0.1 });
  assert.ok(differing(round, lowSlider) > 0, "the raggedness drew nothing");
});

test("the raggedness roughens a counted island's shore (Issue #852)", () => {
  const medians = [0, 0.5, 1].map((raggedness) => {
    const ratios = [1, 2, 3, 4, 5].map((seed) =>
      shoreOverLand(countedMask(seed, { islands: 20, raggedness }), { w: GRID.gridW, h: GRID.gridH }),
    );
    return median(ratios);
  });
  assert.ok(
    (medians[0] as number) < (medians[1] as number) && (medians[1] as number) < (medians[2] as number),
    `the median shore over land should rise with the raggedness, got ${medians.join(", ")}`,
  );
});

test("a counted world takes the archipelago's share of land, whatever its land fraction says (Issue #852)", () => {
  const recipe = defaultRecipe(7, { mapType: "archipelago", islands: 20, landFraction: 0.5 });
  assert.equal(landShareOf(recipe), 0.24);
  const world = generateWorld(recipe);
  let land = 0;
  for (const v of landMask(world.elev, world.seaLevel)) land += v;
  assert.ok(Math.abs(land - Math.round(0.24 * 76_800)) <= 1, `the counted world holds ${land} land cells`);
});

test("varied sizes never cover less of the sheet than alike ones (Issue #852)", () => {
  const short: string[] = [];
  let lowest = Infinity;
  for (let seed = 1; seed <= 200; seed++) {
    for (const count of [2, 3, 4, 5, 8, 10, 20]) {
      const ratio =
        coverage(placeLobes(seed, count, "varied", ASPECT)) / coverage(placeLobes(seed, count, "equal", ASPECT));
      lowest = Math.min(lowest, ratio);
      if (ratio < 1 - 1e-12) short.push(`seed ${seed}, asked ${count}: varied covers ${ratio} of the alike sizes`);
    }
  }
  assert.deepEqual(short, [], `the lowest ratio was ${lowest}`);
});

test("a counted world keeps the sea on all four borders at small counts, both sizes and both ends of the raggedness (Issue #852)", () => {
  const onBorder: string[] = [];
  // 2026-10-28, Issue #852: with today's edge sink, 209 of 3,600 small-count worlds (seeds 1 to 100, asked 2 to 20) put land on the border, seed 8 at asked 2 alike and round among them (12 cells), this test's witness; with the counted sink, none in 5,400 worlds (seeds 1 to 100, asked 2 to 100).
  const sizes: ReadonlyArray<IsleSize> = ["equal", "varied"];
  const inputs = [1, 8, 13, 20].flatMap((seed) =>
    [2, 3, 5, 8].flatMap((islands) =>
      sizes.flatMap((isleSize) => [0, 1].map((raggedness) => ({ seed, islands, isleSize, raggedness }))),
    ),
  );
  for (const { seed, ...over } of inputs) {
    const cells = borderLand(countedMask(seed, over));
    if (cells > 0) onBorder.push(`seed ${seed}, ${JSON.stringify(over)}: ${cells} border cells`);
  }
  assert.deepEqual(onBorder, [], "a counted world put land on its border");
});
