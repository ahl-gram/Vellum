import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, minMax } from "../../src/core/grid.ts";
import { createRng } from "../../src/core/rng.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { coastRingsGrid } from "../../src/render/coast.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { hypsometricLayer } from "../../src/render/layers/land.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { pathFrom, renderSvg } from "../../src/render/svg.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { chaikinSmooth, closedIsoRings, type Point } from "../../src/terrain/contours.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";

// The metric is self-consistent in GRID space (no rasterizer, no golden): a small residual survives even with no smoothing (the half-cell iso quantization), so the contract is that pinning lands near that floor.

/** Even-odd point-in-polygon over a set of rings, matching the SVG land fill. */
function drawnAsLand(rings: ReadonlyArray<ReadonlyArray<Point>>, px: number, py: number): boolean {
  let inside = false;
  for (const ring of rings) {
    const n = ring.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const a = ring[i] as Point;
      const b = ring[j] as Point;
      const ay = a[1];
      const by = b[1];
      if (ay > py !== by > py) {
        const x = ((b[0] - a[0]) * (py - ay)) / (by - ay) + a[0];
        if (px < x) inside = !inside;
      }
    }
  }
  return inside;
}

/** Fraction of true-land grid points the coast rings exclude (draw as ocean). */
function phantomSeaFraction(world: World, rings: ReadonlyArray<ReadonlyArray<Point>>): number {
  const { elev, seaLevel } = world;
  let land = 0;
  let phantom = 0;
  // Nudge off the integer lattice so a sample never lands exactly on a frame or marching-squares edge, where the even-odd parity is ambiguous.
  const EPS = 1e-4;
  for (let y = 0; y < elev.h; y++) {
    for (let x = 0; x < elev.w; x++) {
      if (elev.at(x, y) <= seaLevel) continue;
      land++;
      if (!drawnAsLand(rings, x + EPS, y + EPS)) phantom++;
    }
  }
  return land === 0 ? 0 : phantom / land;
}

function plainRings(world: World, iters: number): Point[][] {
  return closedIsoRings(world.elev, world.seaLevel).map((c) => chaikinSmooth(c.points, true, iters));
}

function capitalRegion(seed: number, size = 0.38): World {
  const world = generateWorld(defaultRecipe(seed));
  const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
  return generateRegionWorld(world, {
    window: windowAround(world, capital, size),
    gridW: world.recipe.gridW,
    gridH: world.recipe.gridH,
    title: "Test Region",
  });
}

const COAST_ITERS = 2; // coastSmoothingIterations(1500), the chart-width default

test("pinned region coast recovers the smoothing-induced phantom sea (#223)", () => {
  const region = capitalRegion(42);
  const plain = phantomSeaFraction(region, plainRings(region, COAST_ITERS));
  const pinned = phantomSeaFraction(region, coastRingsGrid(region, COAST_ITERS));
  const floor = phantomSeaFraction(region, plainRings(region, 0)); // no smoothing

  assert.ok(plain > 0.03, `expected plain smoothing to show real phantom sea, got ${(plain * 100).toFixed(1)}%`);
  assert.ok(
    pinned < plain / 3,
    `pinned ${(pinned * 100).toFixed(1)}% must be < plain/3 ${((plain / 3) * 100).toFixed(1)}%`,
  );
  assert.ok(
    pinned <= floor + 0.005,
    `pinned ${(pinned * 100).toFixed(1)}% must sit near the floor ${(floor * 100).toFixed(1)}%`,
  );
});

test("pinned region coast holds across seeds and an edge-clamped window (#223)", () => {
  const cases: Array<[string, World]> = [
    ["seed 100 capital", capitalRegion(100)],
    // A large window clamps against the world edge: long frame runs with real land hard against the corners, the worst case.
    ["seed 42 wide/clamped", capitalRegion(42, 0.7)],
  ];
  for (const [label, region] of cases) {
    const plain = phantomSeaFraction(region, plainRings(region, COAST_ITERS));
    const pinned = phantomSeaFraction(region, coastRingsGrid(region, COAST_ITERS));
    assert.ok(
      pinned <= plain,
      `${label}: pinning must never add phantom sea (${(pinned * 100).toFixed(1)}% vs ${(plain * 100).toFixed(1)}%)`,
    );
    if (plain > 0.03) {
      assert.ok(
        pinned < plain / 2,
        `${label}: pinned ${(pinned * 100).toFixed(1)}% must beat plain/2 ${((plain / 2) * 100).toFixed(1)}%`,
      );
    }
  }
});

test("region survey clips rivers to the drawn coast (#223)", () => {
  const region = capitalRegion(42);
  const svg = renderMap(region, { style: "antique", widthPx: 1500 });
  assert.match(svg, /<clipPath id="region-land-clip">/, "region-land-clip must be defined");
  assert.match(
    svg,
    /<g clip-path="url\(#region-land-clip\)"><g id="layer-rivers"/,
    "the rivers layer must be wrapped in the region clip, not just declared",
  );
});

test("world charts carry no region clip, keeping goldens byte-identical (#223)", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "antique", widthPx: 1500 });
  assert.ok(!svg.includes("region-land-clip"), "world chart must have no region clip");
});

test("world coast is unpinned: region gate does not touch world charts (#223)", () => {
  const world = generateWorld(defaultRecipe(42));
  assert.equal(world.region, undefined);
  assert.deepEqual(coastRingsGrid(world, COAST_ITERS), plainRings(world, COAST_ITERS));
});

const WAPAUWAU_BAND3: UvWindow = { u0: 0.484375, v0: 0.1875, u1: 0.609375, v1: 0.3125 };
const MARA_BAND4: UvWindow = { u0: 0.4140625, v0: 0.6328125, u1: 0.4765625, v1: 0.6953125 };
const PLOT = createProjection(320, 240, 1500, marginFor(1500));
const FRAME_CORNERS: Point[] = [
  [0, 0],
  [319, 0],
  [319, 239],
  [0, 239],
];
const FRAME_D = pathFrom(
  FRAME_CORNERS.map(([x, y]) => [PLOT.px(x), PLOT.py(y)] as const),
  true,
);

function regionAt(seed: number, window: UvWindow): World {
  const world = generateWorld(defaultRecipe(seed));
  return generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "Test Region" });
}

let wapauwau: World | undefined;
const wapauwauBand3 = (): World => (wapauwau ??= regionAt(11, WAPAUWAU_BAND3));
let mara: World | undefined;
const maraBand4 = (): World => (mara ??= regionAt(7, MARA_BAND4));

const maraSvgs = new Map<StyleName, string>();
function maraSvg(style: StyleName): string {
  const cached = maraSvgs.get(style);
  if (cached !== undefined) return cached;
  const svg = renderMap(maraBand4(), { style, widthPx: 1500 });
  maraSvgs.set(style, svg);
  return svg;
}

function frameOf(world: World): Point[] {
  const { w, h } = world.elev;
  return [
    [0, 0],
    [w - 1, 0],
    [w - 1, h - 1],
    [0, h - 1],
  ];
}

function frameAbove(world: World, iso: number): boolean {
  const { elev } = world;
  for (let x = 0; x < elev.w; x++) if (elev.at(x, 0) <= iso || elev.at(x, elev.h - 1) <= iso) return false;
  for (let y = 0; y < elev.h; y++) if (elev.at(0, y) <= iso || elev.at(elev.w - 1, y) <= iso) return false;
  return true;
}

function phantomLandFraction(world: World, rings: ReadonlyArray<ReadonlyArray<Point>>): number {
  const { elev, seaLevel } = world;
  let water = 0;
  let phantom = 0;
  const EPS = 1e-4;
  for (let y = 0; y < elev.h; y++) {
    for (let x = 0; x < elev.w; x++) {
      if (elev.at(x, y) > seaLevel) continue;
      water++;
      if (drawnAsLand(rings, x + EPS, y + EPS)) phantom++;
    }
  }
  return water === 0 ? 0 : phantom / water;
}

function firstPathIn(svg: string, anchor: string): string {
  const at = svg.indexOf(anchor);
  assert.notEqual(at, -1, `the sheet holds ${anchor}`);
  const d = /<path d="([^"]*)"/.exec(svg.slice(at, svg.indexOf("</", at)))?.[1];
  assert.ok(d !== undefined, `a path opens ${anchor}`);
  return d;
}

test("chart 11's Wapauwau at band 3, its frame all land round a lake, draws its land as land and its lake as water (Issue #972)", () => {
  const region = wapauwauBand3();
  assert.ok(
    frameAbove(region, region.seaLevel),
    "Wapauwau's band-3 window must hold land on every frame vertex, or this test cannot fail; re-sweep for a window that does",
  );
  assert.ok(closedIsoRings(region.elev, region.seaLevel).length > 0, "Wapauwau's band-3 window must hold a lake");
  const rings = coastRingsGrid(region, COAST_ITERS);
  const floor = [frameOf(region), ...plainRings(region, 0)];
  const sea = phantomSeaFraction(region, rings);
  const seaFloor = phantomSeaFraction(region, floor);
  assert.ok(
    sea <= seaFloor + 0.005,
    `phantom sea ${(sea * 100).toFixed(2)}% must sit near the floor ${(seaFloor * 100).toFixed(2)}%`,
  );
  const land = phantomLandFraction(region, rings);
  const landFloor = phantomLandFraction(region, floor);
  assert.ok(
    land <= landFloor + 0.005,
    `phantom land ${(land * 100).toFixed(2)}% must sit near the floor ${(landFloor * 100).toFixed(2)}%`,
  );
});

test("the drawn close-up opens its land fill and its land clip with the frame (Issue #972)", () => {
  const svg = renderMap(wapauwauBand3(), { style: "antique", widthPx: 1500 });
  assert.ok(
    firstPathIn(svg, '<g id="layer-land">').startsWith(FRAME_D),
    "the land fill must open on the frame, so the lake is cut out of the land",
  );
  assert.ok(
    firstPathIn(svg, '<clipPath id="region-land-clip">').startsWith(FRAME_D),
    "the land clip must open on the frame, so the rivers and tints stand on the land",
  );
});

test("chart 7's Mara at band 4 opens its first hypsometric tint with the frame (Issue #972)", () => {
  const region = maraBand4();
  const t = STYLES.topographic.hypsometric?.[1]?.t;
  assert.ok(t === 0.14, "the first tinted stop is 0.14");
  const { max } = minMax(region.elev);
  assert.ok(
    frameAbove(region, region.seaLevel + t * Math.max(1e-9, max - region.seaLevel)),
    "Mara's band-4 frame must stand above the first tinted stop, or this test cannot fail",
  );
  assert.ok(
    firstPathIn(maraSvg("topographic"), '<g id="layer-hypsometric">').startsWith(FRAME_D),
    "the first tint must open on the frame, so the lake is cut out of the tint",
  );
});

test("chart 7's Mara at band 4 opens its first deep band with the frame (Issue #972)", () => {
  assert.ok(
    frameAbove(maraBand4(), maraBand4().seaLevel),
    "Mara's band-4 frame must be all land, and so above every water level",
  );
  assert.ok(
    firstPathIn(maraSvg("topographic"), '<g id="layer-ocean">').startsWith(FRAME_D),
    "the first deep band must open on the frame",
  );
});

test("chart 7's Mara at band 4 opens its shoal with the frame on the nautical dress (Issue #972)", () => {
  assert.ok(
    frameAbove(maraBand4(), maraBand4().seaLevel),
    "Mara's band-4 frame must be all land, and so above every water level",
  );
  assert.ok(
    firstPathIn(maraSvg("nautical"), '<g id="layer-ocean">').startsWith(FRAME_D),
    "the shoal must open on the frame",
  );
});

test("a tint the whole close-up stands above is painted to the frame (Issue #972)", () => {
  const region = maraBand4();
  const world: World = { ...region, elev: createField(320, 240, () => region.seaLevel + 1) };
  const ctx: RenderCtx = {
    world,
    style: STYLES.topographic,
    proj: PLOT,
    coastRings: [],
    elevSpan: 2,
    rng: createRng(7).fork("render"),
    realmTint: [],
    labels: createLabelArena(),
  };
  const layer = hypsometricLayer(ctx);
  assert.ok(layer, "the topographic dress has a hypsometric layer");
  const svg = renderSvg(layer);
  assert.equal(svg.split("<path").length - 1, 3, "three stops under the field, each painted");
  assert.equal(svg.split('<path d="' + FRAME_D + '"').length - 1, 3, "each painted as the frame alone");
});
