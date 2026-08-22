import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeightfield, type TerrainParams } from "../../src/terrain/heightfield.ts";

const RECIPE = {
  seed: 42,
  gridW: 80,
  gridH: 60,
  mapType: "island",
} as const;

// A band-3 sized window (sizeUV 0.125) and a centre window used by the ridge guard below.
const BAND3_WINDOW = { u0: 0.4, v0: 0.3, u1: 0.525, v1: 0.425 } as const;
const CENTRE_WINDOW = { u0: 0.4, v0: 0.4, u1: 0.6, v1: 0.6 } as const;

test("detail 0 reproduces the plain field byte for byte (#396)", () => {
  const cases: TerrainParams[] = [
    { seed: 42, gridW: 320, gridH: 240, mapType: "island" },
    { seed: 7, gridW: 80, gridH: 60, mapType: "archipelago" },
    { seed: 2, gridW: 80, gridH: 60, mapType: "continent", window: BAND3_WINDOW },
    { seed: 15, gridW: 80, gridH: 60, mapType: "citystate", coastWarp: 1.0 },
  ];
  for (const params of cases) {
    const plain = buildHeightfield(params);
    const zero = buildHeightfield({ ...params, detail: 0 });
    assert.deepEqual(
      zero.data,
      plain.data,
      `detail 0 diverged from the plain field for seed ${params.seed} ${params.mapType}`,
    );
  }
});

test("a nonzero detail level changes the field (#396)", () => {
  const zero = buildHeightfield({ ...RECIPE, window: BAND3_WINDOW });
  const fine = buildHeightfield({ ...RECIPE, window: BAND3_WINDOW, detail: 3 });
  assert.notDeepEqual(fine.data, zero.data, "detail 3 left the field untouched");
});

test("detail is keyed off the window, never the grid: same window + detail, finer grid, same values (#396)", () => {
  const coarse = buildHeightfield({ ...RECIPE, window: BAND3_WINDOW, detail: 3 });
  const fine = buildHeightfield({
    ...RECIPE,
    gridW: 159,
    gridH: 119,
    window: BAND3_WINDOW,
    detail: 3,
  });
  for (const [x, y] of [[10, 10], [40, 30], [70, 50]] as const) {
    assert.ok(
      Math.abs(coarse.at(x, y) - fine.at(2 * x, 2 * y)) < 1e-12,
      `resolution divergence at ${x},${y} under detail 3`,
    );
  }
});

test("ridged2's octave count is independent of the detail level (#396)", () => {
  // coastWarp 0 + a centre window keep falloff at 1 and the edge sink at 0, so e = e01 + ridgedWeight * ridge * ridgeMask(e01) exactly; where the mask is saturated at both detail levels the weighted difference isolates ridge alone. Seed 30 measured 174 cells at e01 >= 0.8 in this window (seeds 1-120 swept, all others carry 0), so the fixture is the one seed that makes the guard non-vacuous.
  const base = {
    seed: 30,
    gridW: 80,
    gridH: 60,
    mapType: "island",
    coastWarp: 0,
    window: CENTRE_WINDOW,
  } as const;
  const W = 0.4;
  const e0 = buildHeightfield({ ...base, ridgedWeight: 0, detail: 0 });
  const r0 = buildHeightfield({ ...base, ridgedWeight: W, detail: 0 });
  const e3 = buildHeightfield({ ...base, ridgedWeight: 0, detail: 3 });
  const r3 = buildHeightfield({ ...base, ridgedWeight: W, detail: 3 });
  let checked = 0;
  for (let i = 0; i < e0.data.length; i++) {
    const m0 = e0.data[i] as number;
    const m3 = e3.data[i] as number;
    if (m0 < 0.8 || m3 < 0.8) continue;
    checked++;
    const t0 = (r0.data[i] as number) - m0;
    const t3 = (r3.data[i] as number) - m3;
    assert.ok(
      Math.abs(t3 - t0) < 1e-12,
      `ridge contribution moved with the detail level at cell ${i}: ${t0} -> ${t3}`,
    );
  }
  assert.ok(checked >= 50, `too few mask-saturated cells to prove anything: ${checked}`);
});

test("deep-water border guarantee holds at the extended octave count (#396)", () => {
  for (const seed of [42, 7, 2, 15, 23]) {
    for (const coastWarp of [0.55, 0.8, 1.0]) {
      const f = buildHeightfield({
        seed,
        gridW: 80,
        gridH: 60,
        mapType: "island",
        coastWarp,
        detail: 3,
      });
      for (let x = 0; x < f.w; x++) {
        assert.ok(
          f.at(x, 0) < 0 && f.at(x, f.h - 1) < 0,
          `seed ${seed} warp ${coastWarp} detail 3: top/bottom edge land at x=${x}`,
        );
      }
      for (let y = 0; y < f.h; y++) {
        assert.ok(
          f.at(0, y) < 0 && f.at(f.w - 1, y) < 0,
          `seed ${seed} warp ${coastWarp} detail 3: left/right edge land at y=${y}`,
        );
      }
    }
  }
});

test("detail must be a non-negative integer (#396)", () => {
  assert.throws(() => buildHeightfield({ ...RECIPE, detail: -1 }), RangeError);
  assert.throws(() => buildHeightfield({ ...RECIPE, detail: 1.5 }), RangeError);
});
