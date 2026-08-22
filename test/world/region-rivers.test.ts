import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { extendMouthToWater } from "../../src/world/region-rivers.ts";
import type { FlowResult } from "../../src/hydrology/flow.ts";

const SEA = 0;

/** A 1D chute running east: every land cell drains to its neighbour, the last two cells are water. */
function chute(w: number, h: number, waterFrom: number): {
  elev: ReturnType<typeof createField>;
  flow: FlowResult;
} {
  const elev = createField(w, h, (x) => (x >= waterFrom ? -0.5 : 1 - x * 0.01));
  const dir = new Int32Array(w * h).fill(-1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) dir[x + y * w] = x + 1 + y * w;
  }
  return { elev, flow: { dir, acc: new Float64Array(w * h).fill(1), fill: new Float64Array(w * h) } };
}

test("a mouth already in water is left exactly as the parent drew it", () => {
  const { elev, flow } = chute(20, 4, 10);
  const points = [{ x: 8, y: 1, acc: 5 }, { x: 10, y: 1, acc: 5 }];
  assert.deepEqual(extendMouthToWater(points, elev, flow, SEA, 12), points);
});

test("a mouth stranded on new land follows the region's own drainage to the waterline", () => {
  // The parent charted the sea at x=6; the detailed field has land out to x=9.
  const { elev, flow } = chute(20, 4, 10);
  const points = [{ x: 5, y: 1, acc: 5 }, { x: 6, y: 1, acc: 5 }];
  const out = extendMouthToWater(points, elev, flow, SEA, 12);
  assert.deepEqual(
    out.map((p) => p.x),
    [5, 6, 7, 8, 9, 10],
    "the run walks downhill until it reaches water, and stops there",
  );
  assert.ok((elev.data[(out[out.length - 1]!.x) + 1 * 20] as number) <= SEA, "it ends in water");
});

test("a mouth with no water within reach is left alone rather than dragged across the sheet", () => {
  const { elev, flow } = chute(20, 4, 19);
  const points = [{ x: 1, y: 1, acc: 5 }, { x: 2, y: 1, acc: 5 }];
  assert.deepEqual(extendMouthToWater(points, elev, flow, SEA, 4), points);
});

test("a drainage that loops back on itself terminates instead of spinning", () => {
  const w = 8;
  const h = 3;
  const elev = createField(w, h, () => 1);
  const dir = new Int32Array(w * h).fill(-1);
  dir[2 + 1 * w] = 3 + 1 * w;
  dir[3 + 1 * w] = 2 + 1 * w;
  const flow: FlowResult = { dir, acc: new Float64Array(w * h).fill(1), fill: new Float64Array(w * h) };
  const points = [{ x: 1, y: 1, acc: 5 }, { x: 2, y: 1, acc: 5 }];
  assert.deepEqual(extendMouthToWater(points, elev, flow, SEA, 64), points);
});

test("on the detailed field no region river stops on interior dry land (seed 2, band 2)", () => {
  // The window where the sweep caught it: a parent major's mouth cell is parent SEA and
  // detailed-region LAND, so without the extension the river is drawn short of the water.
  const world = generateWorld(defaultRecipe(2));
  const window = lodWindowFor(0.625, 0.375, 0.25);
  const region = generateRegionWorld(world, {
    window,
    gridW: 320,
    gridH: 240,
    title: "Sweep Environs",
    detail: true,
  });
  const w = region.elev.w;
  const cells = region.rivers.map(
    (r) => new Set(r.points.map((p) => Math.round(p.x) + Math.round(p.y) * w)),
  );
  const tol = 5; // the band's fine-cells-per-parent-cell, plus one
  const stranded = region.rivers.filter((river, i) => {
    const last = river.points[river.points.length - 1]!;
    const x = Math.round(last.x);
    const y = Math.round(last.y);
    if (x <= tol || y <= tol || x >= w - 1 - tol || y >= region.elev.h - 1 - tol) return false;
    if ((region.elev.data[x + y * w] as number) <= region.seaLevel) return false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const idx = x + dx + (y + dy) * w;
        if (cells.some((c, j) => j !== i && c.has(idx))) return false;
      }
    }
    return true;
  });
  assert.deepEqual(
    stranded.map((r) => r.points[r.points.length - 1]),
    [],
    "every river reaches the sea, a confluence, or the window edge",
  );
});
