import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { coastRingsGrid } from "../../src/render/coast.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import {
  chaikinSmooth,
  closedIsoRings,
  type Point,
} from "../../src/terrain/contours.ts";
import type { World } from "../../src/world/types.ts";

/**
 * #223 root fix: on a regional survey the coast is closed against the zoom-window
 * rectangle, and plain Chaikin corner-cutting rounds those frame corners inward,
 * carving real land back over the ocean rect painted behind it (the "phantom
 * sea"). The fix pins the frame vertices so only the true shore rounds. These
 * tests measure the phantom sea directly: the fraction of genuine land grid
 * points (elevation above the waterline) that the drawn coast excludes.
 *
 * The metric is a self-consistent comparison in GRID space (same space the coast
 * rings and the heightfield share), so it needs no rasterizer and no golden. A
 * small residual survives even with no smoothing at all: it is the half-cell
 * quantization of the iso line, not a bug. The contract is that pinning removes
 * essentially all of the SMOOTHING-induced phantom sea, landing near that floor.
 */

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
      if ((ay > py) !== (by > py)) {
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
  // Nudge off the integer lattice so a sample never lands exactly on a frame or
  // marching-squares edge (both are lattice-aligned), which would make the
  // even-odd parity ambiguous.
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
  return closedIsoRings(world.elev, world.seaLevel).map((c) =>
    chaikinSmooth(c.points, true, iters),
  );
}

function capitalRegion(seed: number, size = 0.38): World {
  const world = generateWorld(defaultRecipe(seed));
  const capital =
    world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
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

  // Plain smoothing carves a real amount of land into ocean...
  assert.ok(plain > 0.03, `expected plain smoothing to show real phantom sea, got ${(plain * 100).toFixed(1)}%`);
  // ...pinning cuts that by at least two thirds...
  assert.ok(pinned < plain / 3, `pinned ${(pinned * 100).toFixed(1)}% must be < plain/3 ${((plain / 3) * 100).toFixed(1)}%`);
  // ...landing at the no-smoothing floor (the irreducible iso quantization).
  assert.ok(pinned <= floor + 0.005, `pinned ${(pinned * 100).toFixed(1)}% must sit near the floor ${(floor * 100).toFixed(1)}%`);
});

test("pinned region coast holds across seeds and an edge-clamped window (#223)", () => {
  const cases: Array<[string, World]> = [
    ["seed 100 capital", capitalRegion(100)],
    // A large window clamps against the world edge, forcing long frame runs and
    // real land hard up against the frame corners (the worst case for #223).
    ["seed 42 wide/clamped", capitalRegion(42, 0.7)],
  ];
  for (const [label, region] of cases) {
    const plain = phantomSeaFraction(region, plainRings(region, COAST_ITERS));
    const pinned = phantomSeaFraction(region, coastRingsGrid(region, COAST_ITERS));
    assert.ok(pinned <= plain, `${label}: pinning must never add phantom sea (${(pinned * 100).toFixed(1)}% vs ${(plain * 100).toFixed(1)}%)`);
    if (plain > 0.03) {
      assert.ok(pinned < plain / 2, `${label}: pinned ${(pinned * 100).toFixed(1)}% must beat plain/2 ${((plain / 2) * 100).toFixed(1)}%`);
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
  // A standalone world has no region window, so coastRingsGrid must return the
  // exact plain smooth (guards the byte-identity of the committed goldens).
  const world = generateWorld(defaultRecipe(42));
  assert.equal(world.region, undefined);
  assert.deepEqual(coastRingsGrid(world, COAST_ITERS), plainRings(world, COAST_ITERS));
});
