import { test } from "node:test";
import assert from "node:assert/strict";
import { gradientNoise2 } from "../../src/noise/gradient.ts";
import { fbm2, ridged2, warped2, OCTAVE_OFFSETS } from "../../src/noise/fbm.ts";
import { createRng } from "../../src/core/rng.ts";

test("gradient noise is deterministic", () => {
  assert.equal(gradientNoise2(3.7, -2.2, 42), gradientNoise2(3.7, -2.2, 42));
  assert.notEqual(gradientNoise2(3.7, -2.2, 42), gradientNoise2(3.7, -2.2, 43));
});

test("gradient noise is exactly zero at integer lattice points", () => {
  for (const [x, y] of [[0, 0], [5, 3], [-7, 2], [100, -50]] as const) {
    assert.equal(gradientNoise2(x, y, 7), 0);
  }
});

test("gradient noise stays within [-1.01, 1.01]", () => {
  const rng = createRng(1);
  for (let i = 0; i < 20000; i++) {
    const v = gradientNoise2(rng.range(-100, 100), rng.range(-100, 100), 9);
    assert.ok(Math.abs(v) <= 1.01, `out of range: ${v}`);
  }
});

test("gradient noise is continuous", () => {
  const rng = createRng(2);
  for (let i = 0; i < 200; i++) {
    const x = rng.range(-50, 50);
    const y = rng.range(-50, 50);
    const a = gradientNoise2(x, y, 3);
    const b = gradientNoise2(x + 0.001, y, 3);
    assert.ok(Math.abs(a - b) < 0.05, `discontinuity at ${x},${y}`);
  }
});

test("gradient noise is non-constant with real variance", () => {
  const rng = createRng(3);
  const samples = Array.from({ length: 500 }, () =>
    gradientNoise2(rng.range(0, 40) + 0.5, rng.range(0, 40) + 0.5, 5),
  );
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance =
    samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  assert.ok(variance > 0.01, `variance too small: ${variance}`);
});

test("fbm is deterministic, bounded, and continuous", () => {
  assert.equal(fbm2(1.5, 2.5, 11), fbm2(1.5, 2.5, 11));
  const rng = createRng(4);
  for (let i = 0; i < 5000; i++) {
    const x = rng.range(-30, 30);
    const y = rng.range(-30, 30);
    const v = fbm2(x, y, 11);
    assert.ok(Math.abs(v) <= 1.05, `fbm out of range: ${v}`);
    const w = fbm2(x + 0.0005, y, 11);
    assert.ok(Math.abs(v - w) < 0.05, "fbm discontinuity");
  }
});

test("fbm octave count changes the field", () => {
  const a = fbm2(3.3, 4.4, 5, { octaves: 1 });
  const b = fbm2(3.3, 4.4, 5, { octaves: 6 });
  assert.notEqual(a, b);
});

test("ridged noise stays in [0, 1.01] and is deterministic", () => {
  const rng = createRng(6);
  for (let i = 0; i < 5000; i++) {
    const v = ridged2(rng.range(-20, 20), rng.range(-20, 20), 13);
    assert.ok(v >= 0 && v <= 1.01, `ridged out of range: ${v}`);
  }
  assert.equal(ridged2(7.7, 8.8, 13), ridged2(7.7, 8.8, 13));
});

test("warp strength zero matches plain fbm", () => {
  const a = warped2(2.2, 3.3, 21, { warpStrength: 0 });
  const b = fbm2(2.2, 3.3, 21);
  assert.equal(a, b);
});

test("warping actually displaces the field", () => {
  const a = warped2(2.2, 3.3, 21, { warpStrength: 0.6 });
  const b = fbm2(2.2, 3.3, 21);
  assert.notEqual(a, b);
});

test("normOctaves pins the amplitude normalizer to the base octave count (#396)", () => {
  // At gain 0.5 the amplitude sum is 2 - 2^(1-n): 1.9375 for 5 octaves, 1.9921875 for 8. Pinned and naive divide the same octave sum, so pinned * norm5 === naive * norm8.
  const NORM5 = 1.9375;
  const NORM8 = 1.9921875;
  const rng = createRng(7);
  for (let i = 0; i < 200; i++) {
    const x = rng.range(-30, 30);
    const y = rng.range(-30, 30);
    const naive = fbm2(x, y, 17, { octaves: 8 });
    const pinned = fbm2(x, y, 17, { octaves: 8, normOctaves: 5 });
    assert.notEqual(pinned, naive, `pin had no effect at ${x},${y}`);
    assert.ok(
      Math.abs(pinned * NORM5 - naive * NORM8) < 1e-12,
      `pinned value is not the same octave sum over the base normalizer at ${x},${y}`,
    );
  }
});

test("normOctaves defaults to octaves: explicit pin is bit-identical to omitted (#396)", () => {
  const rng = createRng(8);
  for (let i = 0; i < 100; i++) {
    const x = rng.range(-30, 30);
    const y = rng.range(-30, 30);
    assert.equal(
      fbm2(x, y, 17, { octaves: 5, normOctaves: 5 }),
      fbm2(x, y, 17, { octaves: 5 }),
    );
    assert.equal(
      fbm2(x, y, 17, { octaves: 6, normOctaves: 6 }),
      fbm2(x, y, 17, { octaves: 6 }),
    );
  }
});

test("warped2 forwards normOctaves to the sampled field (#396)", () => {
  // Both paths: the warpStrength 0 shortcut and the displaced sample.
  const shortcut = warped2(2.2, 3.3, 21, { warpStrength: 0, octaves: 8, normOctaves: 5 });
  assert.equal(shortcut, fbm2(2.2, 3.3, 21, { octaves: 8, normOctaves: 5 }));
  const pinned = warped2(2.2, 3.3, 21, { warpStrength: 0.45, octaves: 8, normOctaves: 5 });
  const naive = warped2(2.2, 3.3, 21, { warpStrength: 0.45, octaves: 8 });
  assert.notEqual(pinned, naive, "the pin did not reach the warped sample");
});

test("OCTAVE_OFFSETS covers the extended octave range without wrapping onto octave 0 (#396)", () => {
  assert.ok(
    OCTAVE_OFFSETS.length >= 12,
    `need at least 12 offsets so base 6 + 3 detail octaves never wrap, got ${OCTAVE_OFFSETS.length}`,
  );
  const seen = new Set(OCTAVE_OFFSETS.map(([ox, oy]) => `${ox},${oy}`));
  assert.equal(seen.size, OCTAVE_OFFSETS.length, "duplicate octave offsets");
  for (let i = 1; i < OCTAVE_OFFSETS.length; i++) {
    const [ox, oy] = OCTAVE_OFFSETS[i] as readonly [number, number];
    assert.ok(
      !Number.isInteger(ox) && !Number.isInteger(oy),
      `offset ${i} sits on the integer lattice, whose zeros align with octave 0's`,
    );
  }
});
