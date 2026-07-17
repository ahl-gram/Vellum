import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { computeClimate } from "../../src/climate/climate.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";

function flatIsland(w: number, h: number, elevation = 0.15) {
  // low flat land with one summit pin so relative elevation stays realistic
  return createField(w, h, (x, y) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return -1;
    if (x === 1 && y === 1) return 1.0;
    return elevation;
  });
}

// #162: a regional survey normalizes its lapse-rate against the PARENT world's
// elevation span, not the window's own max, so a locally-tall-but-globally-modest
// summit does not read colder in the region than on the world chart (a snow seam
// at the window boundary). An explicit elevSpan overrides the field's local max.
test("computeClimate honors an explicit elevSpan (region temperature continuity, #162)", () => {
  const w = 20, h = 20, sea = 0.2;
  // local max is 0.6 (span 0.4); the parent world's span is larger.
  const elev = createField(w, h, (x) => 0.2 + 0.4 * (x / (w - 1)));
  const local = computeClimate(elev, sea, 1, { windDir: 0 });
  const world = computeClimate(elev, sea, 1, { windDir: 0, elevSpan: 1.2 });
  const hi = (w - 1) + 0 * w; // the tallest column
  const lo = 0 + 0 * w; // at the waterline, above == 0, so the span cannot matter
  assert.ok(
    (world.temperature.data[hi] as number) > (local.temperature.data[hi] as number),
    "a larger elevSpan lifts high-elevation temperature toward the world value",
  );
  assert.equal(
    world.temperature.data[lo] as number,
    local.temperature.data[lo] as number,
    "at the shoreline the lapse term is zero, so elevSpan changes nothing",
  );
});

test("south is warmer than north at equal elevation", () => {
  const f = flatIsland(30, 40);
  const { temperature } = computeClimate(f, 0, 99, { windDir: 0 });
  const north = temperature.at(15, 2);
  const south = temperature.at(15, 37);
  assert.ok(south > north, `south ${south} should exceed north ${north}`);
});

test("high peaks are colder than nearby lowland", () => {
  const f = createField(20, 20, (x, y) => {
    if (x === 0 || y === 0 || x === 19 || y === 19) return -1;
    return x === 10 && y === 10 ? 1.4 : 0.1;
  });
  const { temperature } = computeClimate(f, 0, 5, { windDir: 0 });
  assert.ok(temperature.at(10, 10) < temperature.at(12, 10) - 0.2);
});

test("coastal land is wetter than the deep interior on average", () => {
  const f = flatIsland(60, 40);
  const { moisture } = computeClimate(f, 0, 7, { windDir: 0 });
  let coastSum = 0;
  let coastN = 0;
  let interiorSum = 0;
  let interiorN = 0;
  for (let y = 1; y < 39; y++) {
    for (let x = 1; x < 59; x++) {
      const distEdge = Math.min(x, y, 59 - x, 39 - y);
      if (distEdge <= 2) {
        coastSum += moisture.at(x, y);
        coastN++;
      } else if (distEdge >= 12) {
        interiorSum += moisture.at(x, y);
        interiorN++;
      }
    }
  }
  assert.ok(coastSum / coastN > interiorSum / interiorN + 0.04);
});

test("river corridors are wetter than dry plains", () => {
  const w = 60;
  const f = flatIsland(w, 40);
  const riverCells = new Uint8Array(w * 40);
  for (let y = 5; y < 35; y++) riverCells[20 + y * w] = 1; // vertical river at x=20
  // wind from the east makes the far strip the maritime one, so the river
  // corridor must out-wet a headwind handicap: this stays a pure river test
  const { moisture } = computeClimate(f, 0, 7, { riverCells, windDir: Math.PI });
  let nearSum = 0;
  let nearN = 0;
  let farSum = 0;
  let farN = 0;
  for (let y = 10; y < 30; y++) {
    for (let x = 1; x < 59; x++) {
      const d = Math.abs(x - 20);
      if (d <= 1) {
        nearSum += moisture.at(x, y);
        nearN++;
      } else if (d >= 15 && x < 45) {
        farSum += moisture.at(x, y);
        farN++;
      }
    }
  }
  assert.ok(nearSum / nearN > farSum / farN + 0.08, "river bonus missing");
});

test("climate bands order mean temperature: tropical > temperate > polar", () => {
  const f = buildHeightfield({ seed: 3, gridW: 60, gridH: 45, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const mean = (band: "tropical" | "temperate" | "polar"): number => {
    const { temperature } = computeClimate(f, sea, 3, { band, windDir: 0 });
    let s = 0;
    let n = 0;
    for (let i = 0; i < f.data.length; i++) {
      if ((f.data[i] as number) > sea) {
        s += temperature.data[i] as number;
        n++;
      }
    }
    return s / n;
  };
  const trop = mean("tropical");
  const temp = mean("temperate");
  const pol = mean("polar");
  assert.ok(trop > temp && temp > pol, `${trop} > ${temp} > ${pol} failed`);
});

test("climate fields stay in [0, 1] and are deterministic", () => {
  const f = buildHeightfield({ seed: 13, gridW: 50, gridH: 40, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const a = computeClimate(f, sea, 13, { windDir: 2.1 });
  const b = computeClimate(f, sea, 13, { windDir: 2.1 });
  assert.deepEqual(a.temperature.data, b.temperature.data);
  assert.deepEqual(a.moisture.data, b.moisture.data);
  for (const v of a.temperature.data) assert.ok(v >= 0 && v <= 1);
  for (const v of a.moisture.data) assert.ok(v >= 0 && v <= 1);
});
