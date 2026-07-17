import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import {
  BIOMES,
  biomeName,
  classifyBiomes,
} from "../../src/climate/biomes.ts";
import { computeClimate } from "../../src/climate/climate.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";

function classifyOne(elevRel: number, temp: number, moist: number): number {
  // single interior land cell at given relative elevation; sea level 0, peak 1
  const f = createField(3, 3, (x, y) => {
    if (x === 1 && y === 1) return elevRel;
    if (x === 2 && y === 2) return 1; // pin the elevation ceiling
    return -0.5;
  });
  const climate = {
    temperature: createField(3, 3, () => temp),
    moisture: createField(3, 3, () => moist),
  };
  const biomes = classifyBiomes(f, 0, climate);
  return biomes[1 + 1 * 3] as number;
}

// #162: biome bands (snow/alpine caps especially) normalize against the parent
// world's elevation span in a regional survey, so a window that excludes the
// world's true peaks does not sprout false snow on its own tallest hill.
test("classifyBiomes honors an explicit elevSpan (region snow-band continuity, #162)", () => {
  const w = 4, h = 4, sea = 0.2;
  const elev = createField(w, h, (x) => (x === 3 ? 1.0 : 0.3)); // one tall column
  const climate = {
    temperature: createField(w, h, () => 0.5), // cool enough to admit snow/alpine
    moisture: createField(w, h, () => 0.5),
  };
  const tall = 3 + 0 * w;
  // local span = 1.0 - 0.2 = 0.8 -> rel of the peak = 1.0 -> snow
  assert.equal(classifyBiomes(elev, sea, climate)[tall] as number, BIOMES.snow);
  // the parent world's span (4.0) shrinks rel to 0.2 -> a temperate band, no snow
  assert.notEqual(
    classifyBiomes(elev, sea, climate, 4.0)[tall] as number,
    BIOMES.snow,
    "under the world span the region's tallest hill is not falsely snowbound",
  );
});

test("ocean cells classify as ocean", () => {
  const f = createField(3, 3, () => -1);
  const climate = {
    temperature: createField(3, 3, () => 0.5),
    moisture: createField(3, 3, () => 0.5),
  };
  const biomes = classifyBiomes(f, 0, climate);
  for (const b of biomes) assert.equal(b, BIOMES.ocean);
});

test("classic climate corners map to expected biomes", () => {
  assert.equal(classifyOne(0.4, 0.1, 0.5), BIOMES.tundra);
  assert.equal(classifyOne(0.4, 0.35, 0.6), BIOMES.taiga);
  assert.equal(classifyOne(0.4, 0.9, 0.1), BIOMES.desert);
  assert.equal(classifyOne(0.4, 0.9, 0.95), BIOMES.jungle);
  assert.equal(classifyOne(0.4, 0.55, 0.55), BIOMES.temperateForest);
  assert.equal(classifyOne(0.4, 0.9, 0.4), BIOMES.savanna);
});

test("high cold summits get snow; high warm ones get alpine rock", () => {
  assert.equal(classifyOne(0.9, 0.3, 0.5), BIOMES.snow);
  assert.equal(classifyOne(0.72, 0.5, 0.5), BIOMES.alpine);
});

test("warm shoreline becomes beach, soaked lowland becomes marsh", () => {
  assert.equal(classifyOne(0.02, 0.6, 0.5), BIOMES.beach);
  assert.equal(classifyOne(0.06, 0.5, 0.9), BIOMES.marsh);
});

test("biomeName round-trips ids", () => {
  assert.equal(biomeName(BIOMES.jungle), "jungle");
  assert.equal(biomeName(BIOMES.ocean), "ocean");
  assert.throws(() => biomeName(255), RangeError);
});

test("a real island grows a diverse, deterministic biome set", () => {
  const f = buildHeightfield({ seed: 42, gridW: 100, gridH: 75, mapType: "island" });
  const sea = pickSeaLevel(f, 0.36);
  const climate = computeClimate(f, sea, 42, { windDir: 0.9 });
  const a = classifyBiomes(f, sea, climate);
  const b = classifyBiomes(f, sea, climate);
  assert.deepEqual(a, b);

  const landBiomes = new Set<number>();
  for (let i = 0; i < f.data.length; i++) {
    if ((f.data[i] as number) > sea) {
      assert.notEqual(a[i], BIOMES.ocean, "land cell classified as ocean");
      landBiomes.add(a[i] as number);
    } else {
      assert.equal(a[i], BIOMES.ocean);
    }
  }
  assert.ok(landBiomes.size >= 4, `expected diversity, got ${landBiomes.size}`);
});
