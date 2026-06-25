import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import {
  marchingSquares,
  chaikinSmooth,
  coastSmoothingIterations,
  ringArea,
} from "../../src/terrain/contours.ts";

test("uniform fields produce no contours", () => {
  const low = createField(5, 5, () => 0);
  const high = createField(5, 5, () => 1);
  assert.equal(marchingSquares(low, 0.5).length, 0);
  assert.equal(marchingSquares(high, 0.5).length, 0);
});

test("single peak produces one closed ring around it", () => {
  const f = createField(5, 5, (x, y) => (x === 2 && y === 2 ? 1 : 0));
  const contours = marchingSquares(f, 0.5);
  assert.equal(contours.length, 1);
  const c = contours[0]!;
  assert.equal(c.closed, true);
  assert.ok(c.points.length >= 4);
  for (const [x, y] of c.points) {
    assert.ok(x >= 1 && x <= 3 && y >= 1 && y <= 3, `point outside peak: ${x},${y}`);
  }
});

test("linear field yields an open chain at the exact crossing", () => {
  const f = createField(5, 4, (x) => x);
  const contours = marchingSquares(f, 2.25);
  assert.equal(contours.length, 1);
  const c = contours[0]!;
  assert.equal(c.closed, false);
  for (const [x] of c.points) {
    assert.ok(Math.abs(x - 2.25) < 0.001, `interpolation off: ${x}`);
  }
  const ys = c.points.map(([, y]) => y);
  assert.ok(Math.min(...ys) === 0 && Math.max(...ys) === 3, "chain must span the grid");
});

test("crater produces nested outer and inner rings", () => {
  // 7×7: ring of 1s at radius ~2, hole in the center
  const f = createField(7, 7, (x, y) => {
    const d = Math.max(Math.abs(x - 3), Math.abs(y - 3));
    return d === 2 ? 1 : 0;
  });
  const contours = marchingSquares(f, 0.5);
  assert.equal(contours.length, 2);
  assert.ok(contours.every((c) => c.closed));
  const areas = contours.map((c) => Math.abs(ringArea(c.points))).sort((a, b) => a - b);
  assert.ok(areas[1]! > areas[0]!, "outer ring should enclose more area");
});

test("island and hole rings have opposite winding signs", () => {
  const f = createField(7, 7, (x, y) => {
    const d = Math.max(Math.abs(x - 3), Math.abs(y - 3));
    return d === 2 ? 1 : 0;
  });
  const contours = marchingSquares(f, 0.5);
  const signs = contours.map((c) => Math.sign(ringArea(c.points)));
  assert.equal(signs[0]! * signs[1]!, -1, "windings should oppose");
});

test("saddle cell resolves into two separate chains", () => {
  const f = createField(2, 2, (x, y) => (x === y ? 1 : 0));
  const contours = marchingSquares(f, 0.5);
  assert.equal(contours.length, 2);
});

test("two separate peaks produce two rings", () => {
  const f = createField(9, 5, (x, y) =>
    (x === 2 && y === 2) || (x === 6 && y === 2) ? 1 : 0,
  );
  const contours = marchingSquares(f, 0.5);
  assert.equal(contours.length, 2);
  assert.ok(contours.every((c) => c.closed));
});

test("contours contain no NaN and are deterministic", () => {
  const f = createField(8, 8, (x, y) => Math.sin(x * 1.3) * Math.cos(y * 0.7));
  const a = marchingSquares(f, 0.1);
  const b = marchingSquares(f, 0.1);
  assert.deepEqual(a, b);
  for (const c of a) {
    for (const [x, y] of c.points) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y));
    }
  }
});

test("chaikin smoothing preserves endpoints of open chains", () => {
  const pts: Array<readonly [number, number]> = [[0, 0], [5, 0], [5, 5]];
  const smoothed = chaikinSmooth(pts, false, 2);
  assert.deepEqual(smoothed[0], [0, 0]);
  assert.deepEqual(smoothed[smoothed.length - 1], [5, 5]);
  assert.ok(smoothed.length > pts.length);
});

test("chaikin smoothing of closed ring stays within original bounds", () => {
  const square: Array<readonly [number, number]> = [[0, 0], [4, 0], [4, 4], [0, 4]];
  const smoothed = chaikinSmooth(square, true, 3);
  for (const [x, y] of smoothed) {
    assert.ok(x >= 0 && x <= 4 && y >= 0 && y <= 4);
  }
  assert.ok(smoothed.length > 16);
});

test("ringArea computes the shoelace area", () => {
  const square: Array<readonly [number, number]> = [[0, 0], [2, 0], [2, 2], [0, 2]];
  assert.equal(Math.abs(ringArea(square)), 4);
  const reversed = [...square].reverse();
  assert.equal(ringArea(square), -ringArea(reversed));
});

test("coastSmoothingIterations is a no-op at or below chart width (#27)", () => {
  // The 2 here is load-bearing: it keeps the 1500px chart, the bound atlas, and
  // the committed goldens byte-identical, since the chaikinSmooth call is then
  // unchanged. Anything <= 1500 must return exactly 2.
  for (const w of [1, 500, 1000, 1499, 1500]) {
    assert.equal(coastSmoothingIterations(w), 2, `width ${w} stays at 2`);
  }
});

test("coastSmoothingIterations ramps up for big posters, monotonic and capped (#27)", () => {
  assert.ok(coastSmoothingIterations(1501) >= 2, "just above chart width never drops below 2");
  assert.ok(coastSmoothingIterations(4200) >= 3, "a 4200px poster gets extra smoothing");
  assert.equal(coastSmoothingIterations(4200), 4, "poster width lands on the cap");
  assert.equal(coastSmoothingIterations(100000), 4, "capped so a giant output stays cheap");
  let prev = 0;
  for (let w = 1000; w <= 8000; w += 100) {
    const it = coastSmoothingIterations(w);
    assert.ok(it >= prev, `non-decreasing at width ${w}`);
    prev = it;
  }
});
