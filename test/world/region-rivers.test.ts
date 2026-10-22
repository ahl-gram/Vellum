import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { extendMouthToWater, regionRiverThreshold } from "../../src/world/region-rivers.ts";
import { extractRivers, type River } from "../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";
import type { FlowResult } from "../../src/hydrology/flow.ts";
import { worldRiversDrawn } from "../../scripts/region-detail/feature-match.ts";
import { closeUp, relay, townWindows } from "../../test-support/region-rivers-fixtures.ts";

const SEA = 0;

const HERO = generateWorld(defaultRecipe(42));
const FIFTEEN = generateWorld(defaultRecipe(15));
const TOATAUHE = townWindows(HERO, "Toatauhe");
const WON_BAND_5 = lodWindowFor(0.73828125, 0.671875, 1 / 32);

/** A 1D chute running east: every land cell drains to its neighbour, the tail is water. */
function chute(
  w: number,
  h: number,
  waterFrom: number,
): {
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
  const points = [
    { x: 8, y: 1, acc: 5 },
    { x: 10, y: 1, acc: 5 },
  ];
  assert.deepEqual(extendMouthToWater(points, elev, flow, SEA, 12), points);
});

test("a mouth stranded on new land follows the region's own drainage to the waterline", () => {
  const { elev, flow } = chute(20, 4, 10);
  const points = [
    { x: 5, y: 1, acc: 5 },
    { x: 6, y: 1, acc: 5 },
  ];
  const out = extendMouthToWater(points, elev, flow, SEA, 12);
  assert.deepEqual(
    out.map((p) => p.x),
    [5, 6, 7, 8, 9, 10],
    "the run walks downhill until it reaches water, and stops there",
  );
  assert.ok((elev.data[out[out.length - 1]!.x + 1 * 20] as number) <= SEA, "it ends in water");
});

test("a cell exactly at the waterline counts as water, and the walk stops there", () => {
  // No random-world fixture ever lands exactly on sea level, so only an integer one can pin this.
  const w = 20;
  const h = 4;
  const elev = createField(w, h, (x) => (x === 9 ? SEA : x > 9 ? -0.5 : 1 - x * 0.01));
  const dir = new Int32Array(w * h).fill(-1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) dir[x + y * w] = x + 1 + y * w;
  }
  const flow: FlowResult = {
    dir,
    acc: new Float64Array(w * h).fill(1),
    fill: new Float64Array(w * h),
  };
  const out = extendMouthToWater([{ x: 6, y: 1, acc: 5 }], elev, flow, SEA, 12);
  assert.deepEqual(
    out.map((p) => p.x),
    [6, 7, 8, 9],
    "it halts on the cell that sits at sea level",
  );
});

test("the mouth walk also stops on a cell the caller names, short of the water", () => {
  const { elev, flow } = chute(20, 4, 10);
  const points = [
    { x: 5, y: 1, acc: 5 },
    { x: 6, y: 1, acc: 5 },
  ];
  const out = extendMouthToWater(points, elev, flow, SEA, 12, (c) => c === 8 + 1 * 20);
  assert.deepEqual(
    out.map((p) => p.x),
    [5, 6, 7, 8],
    "the walk halts on the named cell",
  );
  assert.deepEqual(
    extendMouthToWater(points, elev, flow, SEA, 12, (c) => c === 6 + 1 * 20),
    points,
  );
});

test("a mouth with no water within reach is left alone rather than dragged across the sheet", () => {
  const { elev, flow } = chute(20, 4, 19);
  const points = [
    { x: 1, y: 1, acc: 5 },
    { x: 2, y: 1, acc: 5 },
  ];
  assert.deepEqual(extendMouthToWater(points, elev, flow, SEA, 4), points);
});

test("on the detailed field no region river stops on interior dry land (seed 2, band 2)", () => {
  // The window the sweep caught: a parent mouth that is parent SEA and detailed-region LAND.
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
  const cells = region.rivers.map((r) => new Set(r.points.map((p) => Math.round(p.x) + Math.round(p.y) * w)));
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

test("a deep close-up draws the world river crossing it: Won at band 5 on chart 42 (Issue #951)", () => {
  const window = WON_BAND_5;
  const drawn = worldRiversDrawn(HERO, closeUp(HERO, window), window);
  const crossing = drawn.flatMap((d, i) => (d === undefined ? [] : [i]));
  assert.equal(crossing.length, 1, "exactly one world river crosses the witness window");
  assert.equal(drawn[crossing[0] as number], true, "the close-up draws it");
});

function verticesInside(world: World, river: number, window: UvWindow): number {
  const ww = world.recipe.gridW - 1;
  const wh = world.recipe.gridH - 1;
  return (world.rivers[river] as River).points.filter((p) => {
    const u = p.x / ww;
    const v = p.y / wh;
    return u >= window.u0 && u <= window.u1 && v >= window.v0 && v <= window.v1;
  }).length;
}

test("a river drawn on a close-up is drawn one band deeper wherever its course crosses: Stanbyl on chart 15, bands 1 to 5 (Issue #951)", () => {
  const windows = townWindows(FIFTEEN, "Stanbyl");
  const drawn = windows.map((w) => worldRiversDrawn(FIFTEEN, closeUp(FIFTEEN, w), w));
  const lost: string[] = [];
  let withOneVertexInside = 0;
  for (let n = 0; n + 1 < windows.length; n++) {
    (drawn[n] as Array<boolean | undefined>).forEach((here, river) => {
      const deeper = (drawn[n + 1] as Array<boolean | undefined>)[river];
      if (here !== true || deeper === undefined) return;
      if (deeper !== true) lost.push(`world river ${river} is drawn at band ${n + 1} and lost at band ${n + 2}`);
      if (verticesInside(FIFTEEN, river, windows[n + 1] as UvWindow) <= 1) withOneVertexInside++;
    });
  }
  assert.deepEqual(lost, []);
  assert.ok(
    withOneVertexInside >= 1,
    "no river here crosses a deeper window on a single vertex, the class a vertex-pair clip loses",
  );
});

function cellsOf(river: River, w: number): Set<number> {
  return new Set(river.points.map((p) => Math.round(p.x) + Math.round(p.y) * w));
}

const BAND_2_WINDOW = lodWindowFor(0.625, 0.375, 0.25);

test("every laid river ends at the window's edge, in water, or on another drawn river (Issue #951)", () => {
  const stranded: string[] = [];
  const endings = { edge: 0, water: 0, river: 0 };
  [BAND_2_WINDOW, ...TOATAUHE].forEach((window, k) => {
    const { region, laid } = relay(HERO, window);
    const { w, h } = region.elev;
    const cells = region.rivers.map((r) => cellsOf(r, w));
    laid.forEach((river, i) => {
      const last = river.points[river.points.length - 1] as River["points"][number];
      const x = Math.round(last.x);
      const y = Math.round(last.y);
      const cell = x + y * w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) endings.edge++;
      else if ((region.elev.data[cell] as number) <= region.seaLevel) endings.water++;
      else if (cells.some((c, j) => j !== i && c.has(cell))) endings.river++;
      else stranded.push(`window ${k}, laid river ${i} ends at ${x},${y}`);
    });
  });
  assert.deepEqual(stranded, []);
  assert.ok(
    endings.edge > 0 && endings.water > 0 && endings.river > 0,
    `each ending occurs: ${JSON.stringify(endings)}`,
  );
});

test("no river a close-up keeps from its own ground is left ending on dry land (Issue #951)", () => {
  const orphans: string[] = [];
  TOATAUHE.forEach((window, k) => {
    const { region, laid, extracted } = relay(HERO, window);
    const { w, h } = region.elev;
    const cells = region.rivers.map((r) => cellsOf(r, w));
    extracted.forEach((river, j) => {
      const self = laid.length + j;
      const last = river.points[river.points.length - 1] as River["points"][number];
      const x = Math.round(last.x);
      const y = Math.round(last.y);
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return;
      if ((region.elev.data[x + y * w] as number) <= region.seaLevel) return;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (cells.some((c, i) => i !== self && c.has(x + dx + (y + dy) * w))) return;
        }
      }
      orphans.push(`band ${k + 1}, kept river ${j} ends at ${x},${y}`);
    });
  });
  assert.deepEqual(orphans, []);

  const band2 = TOATAUHE[1] as UvWindow;
  const { region, extracted } = relay(HERO, band2);
  const own = extractRivers(region.elev, region.flow, region.seaLevel, {
    absoluteThreshold: regionRiverThreshold(HERO, band2, 320, 240),
  });
  assert.ok(
    own.length > extracted.length,
    "Toatauhe's band-2 close-up drops one of its own rivers, so this fixture can tell a drop from none",
  );
});

test("no drawn river's points stand more than one diagonal step apart, at any band (Issue #951)", () => {
  const gaps: string[] = [];
  [...TOATAUHE, WON_BAND_5].forEach((window, k) => {
    const { rivers } = closeUp(HERO, window);
    assert.ok(
      rivers.some((r) => r.points.length >= 2),
      `fixture window ${k} holds a river of at least two points`,
    );
    rivers.forEach((river, i) => {
      for (let p = 1; p < river.points.length; p++) {
        const a = river.points[p - 1] as River["points"][number];
        const b = river.points[p] as River["points"][number];
        if ((b.x - a.x) ** 2 + (b.y - a.y) ** 2 > 2) gaps.push(`window ${k}, river ${i}, point ${p}`);
      }
    });
  });
  assert.deepEqual(gaps, []);
});
