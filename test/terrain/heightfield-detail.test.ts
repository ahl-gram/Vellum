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

type CellPin = readonly [number, number, number];

test("detail 0 reproduces the plain field byte for byte (#396)", () => {
  // The absolute pins are the non-circular half of the oracle (pr-skeptic: comparing the new path with itself can never see the default path drift): constants measured against main at f83f1b8, where an old-vs-new probe read max |diff| = 0 over every case; tolerance 1e-9 clears ~1e-13 cross-platform libm drift.
  const cases: ReadonlyArray<{ params: TerrainParams; pins: readonly CellPin[] }> = [
    {
      params: { seed: 42, gridW: 320, gridH: 240, mapType: "island" },
      pins: [
        [80, 72, 0.5277893645742845],
        [176, 144, 0.5543560623422775],
        [256, 108, 0.3514573236784098],
      ],
    },
    {
      params: { seed: 7, gridW: 80, gridH: 60, mapType: "archipelago" },
      pins: [
        [20, 18, 0.4913838457534395],
        [44, 36, 0.6082904106309356],
        [64, 27, 0.502981231051687],
      ],
    },
    {
      params: { seed: 2, gridW: 80, gridH: 60, mapType: "continent", window: BAND3_WINDOW },
      pins: [
        [20, 18, 0.5398038374837011],
        [44, 36, 0.403441283162021],
        [64, 27, 0.344794364769785],
      ],
    },
    {
      params: { seed: 15, gridW: 80, gridH: 60, mapType: "citystate", coastWarp: 1.0 },
      pins: [
        [20, 18, 0.18039037961193152],
        [44, 36, 0.47411065981034056],
        [64, 27, 0.4651639781128833],
      ],
    },
  ];
  for (const { params, pins } of cases) {
    const plain = buildHeightfield(params);
    const zero = buildHeightfield({ ...params, detail: 0 });
    assert.deepEqual(
      zero.data,
      plain.data,
      `detail 0 diverged from the plain field for seed ${params.seed} ${params.mapType}`,
    );
    for (const [x, y, v] of pins) {
      assert.ok(
        Math.abs(plain.at(x, y) - v) < 1e-9,
        `seed ${params.seed} ${params.mapType}: default path drifted at ${x},${y}: ${plain.at(x, y)} vs ${v}`,
      );
    }
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

test("the detail extension and its pinned normalizer are wired at every call site (#396)", () => {
  // Measured-constant pin covering the base-warp and both coast-warp call sites (guard-prover and pr-skeptic both showed every relative detail assertion blind to a single-site mutation: a deleted normOctaves renormalizes both sides of a comparison, and a deleted + detail still leaves the other field extending). Constants measured at ca2c7c8 on this fixture; each of the six single-site mutations moves every cell below by >= 4.4e-4, five orders above the 1e-9 tolerance, which itself clears ~1e-13 cross-platform libm drift.
  const f = buildHeightfield({ ...RECIPE, window: BAND3_WINDOW, detail: 3 });
  const PINS: readonly CellPin[] = [
    [14, 19, 0.3799611668863139],
    [13, 6, 0.3870081907275289],
    [27, 13, 0.40708643409915934],
    [47, 7, 0.5276375243152618],
    [34, 3, 0.4224098194943221],
  ];
  for (const [x, y, v] of PINS) {
    assert.ok(
      Math.abs(f.at(x, y) - v) < 1e-9,
      `pinned cell ${x},${y} moved: ${f.at(x, y)} vs ${v}`,
    );
  }
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

test("detail must be an integer within the offsets table's headroom (#396)", () => {
  assert.throws(() => buildHeightfield({ ...RECIPE, detail: -1 }), RangeError);
  assert.throws(() => buildHeightfield({ ...RECIPE, detail: 1.5 }), RangeError);
  // detail 7 would send base octave 12 to OCTAVE_OFFSETS[12 % 12] = [0, 0], the octave-0 lattice aliasing the table exists to prevent
  assert.throws(() => buildHeightfield({ ...RECIPE, detail: 7 }), RangeError);
  assert.doesNotThrow(() => buildHeightfield({ ...RECIPE, gridW: 8, gridH: 6, detail: 6 }));
});
