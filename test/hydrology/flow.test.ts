import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";

test("tilted plane flows straight downhill", () => {
  const w = 10;
  const f = createField(w, 6, (x) => x);
  const { dir } = computeFlow(f, 0.5); // column x=0 is ocean
  assert.equal(dir[5 + 3 * w], 4 + 3 * w, "should step straight left");
  assert.equal(dir[0 + 3 * w], -1, "ocean cells are sinks");
});

test("row accumulation sums upstream cells", () => {
  const w = 10;
  const f = createField(w, 6, (x) => x);
  const { acc } = computeFlow(f, 0.5);
  // each row: chain x=9..1 (9 land cells) drains through x=1
  assert.equal(acc[1 + 3 * w], 9);
  assert.equal(acc[9 + 3 * w], 1);
});

test("fill never sits below the terrain and equals it on ocean", () => {
  const f = buildHeightfield({ seed: 42, gridW: 60, gridH: 45, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const { fill } = computeFlow(f, sea);
  for (let i = 0; i < f.data.length; i++) {
    const e = f.data[i] as number;
    assert.ok((fill[i] as number) >= e - 1e-12);
    if (e <= sea) assert.equal(fill[i], e);
  }
});

test("bowl interior drains to ocean after depression filling", () => {
  // crater: high ring at radius 2, low center, ocean outside radius 3
  const w = 9;
  const f = createField(w, 9, (x, y) => {
    const d = Math.max(Math.abs(x - 4), Math.abs(y - 4));
    if (d === 2) return 1.0;
    if (d < 2) return 0.2;
    return -1.0;
  });
  const { dir } = computeFlow(f, -0.5);
  // center cell must reach an ocean sink in finitely many steps
  let i = 4 + 4 * w;
  let steps = 0;
  while ((dir[i] as number) !== -1) {
    i = dir[i] as number;
    steps++;
    assert.ok(steps <= w * w, "flow cycle detected");
  }
  assert.ok(steps > 0);
});

test("every land cell on a real island drains to the ocean", () => {
  const f = buildHeightfield({ seed: 7, gridW: 80, gridH: 60, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const { dir } = computeFlow(f, sea);
  const n = f.data.length;
  for (let start = 0; start < n; start++) {
    if ((f.data[start] as number) <= sea) continue;
    let i = start;
    let steps = 0;
    while ((dir[i] as number) !== -1) {
      i = dir[i] as number;
      steps++;
      assert.ok(steps <= n, `cycle from cell ${start}`);
    }
  }
});

test("flow is deterministic", () => {
  const f = buildHeightfield({ seed: 11, gridW: 50, gridH: 40, mapType: "island" });
  const sea = pickSeaLevel(f, 0.3);
  const a = computeFlow(f, sea);
  const b = computeFlow(f, sea);
  assert.deepEqual(a.dir, b.dir);
  assert.deepEqual(a.acc, b.acc);
});

test("custom rain weights scale accumulation", () => {
  const w = 10;
  const f = createField(w, 3, (x) => x);
  const rain = new Float64Array(w * 3).fill(2);
  const { acc } = computeFlow(f, 0.5, rain);
  assert.equal(acc[1 + 1 * w], 18, "doubled rain doubles accumulation");
});
