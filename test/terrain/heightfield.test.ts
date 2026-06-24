import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel, landMask, landFractionOf } from "../../src/terrain/sealevel.ts";
import { slopeField } from "../../src/terrain/slope.ts";
import { createField } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { MapType } from "../../src/terrain/heightfield.ts";

const RECIPE = {
  seed: 42,
  gridW: 80,
  gridH: 60,
  mapType: "island",
} as const;

test("heightfield is deterministic for a recipe", () => {
  const a = buildHeightfield(RECIPE);
  const b = buildHeightfield(RECIPE);
  assert.deepEqual(a.data, b.data);
});

test("different seeds give different terrain", () => {
  const a = buildHeightfield(RECIPE);
  const b = buildHeightfield({ ...RECIPE, seed: 43 });
  assert.notDeepEqual(a.data, b.data);
});

test("map border is deeply depressed (ocean guarantee)", () => {
  const f = buildHeightfield(RECIPE);
  let borderMax = -Infinity;
  let interiorMax = -Infinity;
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      const v = f.at(x, y);
      const onBorder = x === 0 || y === 0 || x === f.w - 1 || y === f.h - 1;
      if (onBorder) borderMax = Math.max(borderMax, v);
      else interiorMax = Math.max(interiorMax, v);
    }
  }
  assert.ok(borderMax < interiorMax, "border should sit below the interior");
});

test("coast warp is on by default and reshapes the landmass", () => {
  const warped = buildHeightfield(RECIPE);
  const plain = buildHeightfield({ ...RECIPE, coastWarp: 0 });
  // default must differ from the un-warped radial dome (the on-by-default guard)
  assert.notDeepEqual(warped.data, plain.data);
});

test("coast warp still honors the deep-water border guarantee", () => {
  // a bold warp must not push land into the framed ocean fringe
  const f = buildHeightfield({ ...RECIPE, coastWarp: 0.55 });
  for (let x = 0; x < f.w; x++) {
    assert.ok(f.at(x, 0) < 0 && f.at(x, f.h - 1) < 0, `top/bottom edge land at x=${x}`);
  }
  for (let y = 0; y < f.h; y++) {
    assert.ok(f.at(0, y) < 0 && f.at(f.w - 1, y) < 0, `left/right edge land at y=${y}`);
  }
});

test("map types produce different terrain", () => {
  const island = buildHeightfield(RECIPE);
  const arch = buildHeightfield({ ...RECIPE, mapType: "archipelago" });
  const cont = buildHeightfield({ ...RECIPE, mapType: "continent" });
  assert.notDeepEqual(island.data, arch.data);
  assert.notDeepEqual(island.data, cont.data);
});

test("heightfield is resolution-consistent (same world coords, same value)", () => {
  const coarse = buildHeightfield(RECIPE);
  const fine = buildHeightfield({ ...RECIPE, gridW: 159, gridH: 119 });
  // (x, y) on coarse grid ↔ (2x, 2y) on fine grid: identical uv
  for (const [x, y] of [[10, 10], [40, 30], [70, 50]] as const) {
    assert.ok(
      Math.abs(coarse.at(x, y) - fine.at(2 * x, 2 * y)) < 1e-12,
      `resolution divergence at ${x},${y}`,
    );
  }
});

test("sea level hits the requested land fraction", () => {
  const f = buildHeightfield(RECIPE);
  for (const target of [0.25, 0.35, 0.5]) {
    const sea = pickSeaLevel(f, target);
    const mask = landMask(f, sea);
    const actual = landFractionOf(mask);
    assert.ok(
      Math.abs(actual - target) < 0.04,
      `target ${target}, got ${actual}`,
    );
  }
});

test("sea level leaves the border underwater", () => {
  const f = buildHeightfield(RECIPE);
  const sea = pickSeaLevel(f, 0.35);
  const mask = landMask(f, sea);
  for (let x = 0; x < f.w; x++) {
    assert.equal(mask[x], 0, `border land at top x=${x}`);
    assert.equal(mask[x + (f.h - 1) * f.w], 0, `border land at bottom x=${x}`);
  }
  for (let y = 0; y < f.h; y++) {
    assert.equal(mask[y * f.w], 0, `border land at left y=${y}`);
    assert.equal(mask[f.w - 1 + y * f.w], 0, `border land at right y=${y}`);
  }
});

test("slope of a flat field is zero; tilted plane is uniform", () => {
  const flat = slopeField(createField(6, 6, () => 3));
  for (const v of flat.data) assert.equal(v, 0);

  const tilted = slopeField(createField(6, 6, (x) => x * 2));
  // interior central difference: d/dx = 2
  assert.ok(Math.abs(tilted.at(3, 3) - 2) < 1e-9);
});

// --- #55 Tide Wheel: the override the sea-level slider rides on -----------------
// These lock the engine assumption behind the Explorer slider: landFraction is an
// additive recipe override that only moves the waterline. The slider adds no engine
// code, so these characterize existing behavior (they pass on first write) and act
// as a regression guard. They exercise the FULL pipeline the worker runs, unlike the
// pickSeaLevel + landMask test above which only covers the quantile layer.

const MAP_TYPES: MapType[] = ["island", "archipelago", "continent", "citystate"];

test("generateWorld survives the full slider landFraction band on every map type", () => {
  for (const seed of [42, 7, 1234]) {
    for (const mapType of MAP_TYPES) {
      for (const landFraction of [0.1, 0.7]) {
        const world = generateWorld(defaultRecipe(seed, { mapType, landFraction }));
        assert.ok(
          world.settlements.length > 0,
          `seed ${seed} ${mapType} land ${landFraction}: no settlements`,
        );
      }
    }
  }
});

test("a landFraction override is additive: it shifts no other recipe roll", () => {
  for (const seed of [42, 7, 1234]) {
    const base = defaultRecipe(seed, {});
    const forced = defaultRecipe(seed, { landFraction: 0.5 });
    assert.equal(forced.landFraction, 0.5, "the override takes effect");
    assert.equal(forced.mapType, base.mapType, "mapType unchanged by forcing land");
    assert.equal(forced.band, base.band, "band unchanged by forcing land");
  }
});
