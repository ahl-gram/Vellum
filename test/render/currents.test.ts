import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { traceStreamline } from "../../src/render/layers/currents.ts";

const world = generateWorld(defaultRecipe(7, { gridW: 160, gridH: 120 }));
const { w, h } = world.elev;
const noiseSeed = world.recipe.seed + 7919;
const MIN_OCEAN_DIST = 4;

// a sample of offshore seed cells to trace from
const seeds: Array<[number, number]> = [];
for (let gy = 5; gy < h - 5; gy += 6) {
  for (let gx = 5; gx < w - 5; gx += 6) {
    if ((world.oceanDist[gx + gy * w] as number) >= 7) seeds.push([gx, gy]);
  }
}

test("current streamlines stay over open water (no land overlap)", () => {
  assert.ok(seeds.length > 0, "fixture must have offshore water");
  let full = 0;
  for (const [gx, gy] of seeds) {
    const line = traceStreamline(world, gx, gy, noiseSeed);
    for (const [x, y] of line) {
      const ix = Math.round(x);
      const iy = Math.round(y);
      assert.ok(
        (world.oceanDist[ix + iy * w] as number) >= MIN_OCEAN_DIST,
        `streamline point (${ix},${iy}) sits within ${MIN_OCEAN_DIST} hops of land`,
      );
    }
    if (line.length >= 9) full++;
  }
  assert.ok(full > 0, "at least one full-length streamline should form");
});

test("tracing is deterministic", () => {
  const [gx, gy] = seeds[0]!;
  assert.deepEqual(
    traceStreamline(world, gx, gy, noiseSeed),
    traceStreamline(world, gx, gy, noiseSeed),
  );
});

test("the nautical render (currents included) is byte-identical per seed", () => {
  assert.equal(
    renderMap(world, { style: "nautical", legend: true }),
    renderMap(world, { style: "nautical", legend: true }),
  );
});

test("currents render on nautical and only nautical", () => {
  const naut = renderMap(world, { style: "nautical", legend: true });
  assert.ok(naut.includes("layer-currents"), "nautical should carry currents");
  assert.ok(naut.includes("Ocean current"), "legend lists the current symbol");
  for (const style of ["antique", "topographic", "ink"] as const) {
    const svg = renderMap(world, { style, legend: true });
    assert.ok(!svg.includes("layer-currents"), `${style} must not carry currents`);
  }
});
