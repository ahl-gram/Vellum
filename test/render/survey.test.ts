import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldFrom } from "../../src/core/grid.ts";
import type { Road } from "../../src/society/roads.ts";
import { buildSurvey } from "../../src/render/survey.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// #120: the world facts the worker ships so the client can route a voyage.
// Integer-only by design, so the A2 worker-vs-inline parity compare is exact.

const field = (w: number, h: number, vals: number[]) => fieldFrom(w, h, Float64Array.from(vals));

test("land is 1 strictly ABOVE sea level, 0 at or below it", () => {
  // The waterline test must match world/landmass.ts and generate.ts: `> seaLevel`.
  const elev = field(3, 1, [0.2, 0.5, 0.8]);
  const s = buildSurvey(elev, 0.5, []);
  assert.deepEqual(Array.from(s.land), [0, 0, 1]);
});

test("carries the grid dimensions", () => {
  const s = buildSurvey(field(4, 2, new Array(8).fill(1)), 0, []);
  assert.equal(s.gridW, 4);
  assert.equal(s.gridH, 2);
});

test("land is indexed x + y * gridW (row-major), matching the elevation field", () => {
  const elev = field(2, 2, [1, 0, 0, 1]); // land at (0,0) and (1,1)
  const s = buildSurvey(elev, 0.5, []);
  assert.equal(s.land[0 + 0 * 2], 1);
  assert.equal(s.land[1 + 0 * 2], 0);
  assert.equal(s.land[0 + 1 * 2], 0);
  assert.equal(s.land[1 + 1 * 2], 1);
});

test("roads become grid-space [x,y] polylines, order and points preserved", () => {
  const roads: Road[] = [
    { rank: "trunk", points: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
    { rank: "lane", points: [{ x: 9, y: 9 }] },
  ];
  const s = buildSurvey(field(2, 2, [1, 1, 1, 1]), 0, roads);
  assert.deepEqual(s.roads, [[[1, 2], [2, 2], [3, 3]], [[9, 9]]]);
});

test("a world with no roads yields an empty roads array, not a crash", () => {
  const s = buildSurvey(field(2, 2, [1, 1, 1, 1]), 0, []);
  assert.deepEqual(s.roads, []);
});

test("the payload is integer-only, so it compares byte-exactly across engines", () => {
  const world = generateWorld(defaultRecipe(42, { gridW: 80, gridH: 60 }));
  const s = buildSurvey(world.elev, world.seaLevel, world.roads);
  assert.ok(s.land instanceof Uint8Array);
  for (const v of s.land) assert.ok(v === 0 || v === 1, "land is a 0/1 mask");
  for (const road of s.roads) {
    for (const [x, y] of road) {
      assert.ok(Number.isInteger(x) && Number.isInteger(y), `road point ${x},${y} is not integral`);
    }
  }
});

test("matches the real world's waterline cell for cell", () => {
  const world = generateWorld(defaultRecipe(42, { gridW: 80, gridH: 60 }));
  const s = buildSurvey(world.elev, world.seaLevel, world.roads);
  let land = 0;
  for (let i = 0; i < world.elev.w * world.elev.h; i++) {
    const expected = (world.elev.data[i] as number) > world.seaLevel ? 1 : 0;
    assert.equal(s.land[i], expected, `cell ${i}`);
    land += expected;
  }
  assert.ok(land > 0 && land < world.elev.w * world.elev.h, "a real world has both land and sea");
});

test("does not mutate the elevation field (immutability rule)", () => {
  const elev = field(2, 2, [0.1, 0.9, 0.9, 0.1]);
  const before = Array.from(elev.data);
  buildSurvey(elev, 0.5, []);
  assert.deepEqual(Array.from(elev.data), before);
});
