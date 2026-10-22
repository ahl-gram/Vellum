import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { windowAround } from "../../src/world/region.ts";
import { corridorRadius } from "../../src/world/river-route.ts";
import { harbourReachCells } from "../../src/world/seat-settlements.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";
import { distanceToPolyline, inWindowCourse, worldRoadsDrawn } from "../../scripts/region-detail/feature-match.ts";
import { closeUp, GRID_H, GRID_W, townWindows } from "../../test-support/region-rivers-fixtures.ts";

const HERO = generateWorld(defaultRecipe(42));
const WON_BAND_3: UvWindow = { u0: 0.671875, v0: 0.609375, u1: 0.796875, v1: 0.734375 };
const CAPITAL_WINDOWS = townWindows(HERO, "Laukuwelua");

const crossingRoads = (region: World, window: UvWindow): Array<{ road: number; drawn: boolean }> =>
  worldRoadsDrawn(HERO, region, window).flatMap((drawn, road) => (drawn === undefined ? [] : [{ road, drawn }]));

test("a close-up lays in each world road crossing it: the village Won's band-3 survey (Issue #952)", () => {
  const crossing = crossingRoads(closeUp(HERO, WON_BAND_3), WON_BAND_3);
  assert.ok(crossing.length >= 2, `precondition: at least 2 world roads cross Won's window (${crossing.length})`);
  for (const { road, drawn } of crossing)
    assert.ok(drawn, `world road ${road} crosses Won's band-3 window and is drawn on it`);
});

test("at every band from 1 to 5 the capital's close-up lays in every world road crossing it, so on this witness a road drawn at one band is drawn one band deeper (Issue #952)", () => {
  CAPITAL_WINDOWS.forEach((window, i) => {
    const band = i + 1;
    const crossing = crossingRoads(closeUp(HERO, window), window);
    assert.ok(crossing.length > 0, `precondition: world roads cross the capital's band-${band} window`);
    for (const { road, drawn } of crossing)
      assert.ok(drawn, `world road ${road} is drawn on the capital's band-${band} close-up`);
  });
});

function sheets(): Array<{ readonly name: string; readonly region: World }> {
  const capital = HERO.settlements.find((s) => s.kind === "capital");
  assert.ok(capital !== undefined, "the world has a capital");
  return [
    { name: "Won band 3", region: closeUp(HERO, WON_BAND_3) },
    ...CAPITAL_WINDOWS.map((window, i) => ({ name: `the capital's band ${i + 1}`, region: closeUp(HERO, window) })),
    { name: "the atlas plate", region: closeUp(HERO, windowAround(HERO, capital, 0.38), false) },
  ];
}

test("every laid road stands on land, steps cell to cell, and ends at the sheet's edge, at a town or on another road (Issue #952)", () => {
  for (const { name, region } of sheets()) {
    const { w, h, data } = region.elev;
    assert.ok(region.roads.length > 0, `precondition: ${name} lays roads`);
    const towns = new Set(region.settlements.filter((s) => s.kind !== "hamlet").map((s) => s.x + s.y * w));
    const roadCells = region.roads.map((r) => new Set(r.points.map((p) => p.x + p.y * w)));
    region.roads.forEach((road, i) => {
      for (const p of road.points) {
        assert.ok((data[p.x + p.y * w] as number) > region.seaLevel, `${name}, road ${i}: cell ${p.x},${p.y} is land`);
      }
      for (let k = 1; k < road.points.length; k++) {
        const a = road.points[k - 1] as { x: number; y: number };
        const b = road.points[k] as { x: number; y: number };
        assert.equal(
          Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)),
          1,
          `${name}, road ${i}: step ${k} is to a neighbour`,
        );
      }
      for (const end of [road.points[0], road.points[road.points.length - 1]] as Array<{ x: number; y: number }>) {
        const onEdge = end.x === 0 || end.y === 0 || end.x === w - 1 || end.y === h - 1;
        const onRoad = roadCells.some((cells, j) => j !== i && cells.has(end.x + end.y * w));
        assert.ok(
          onEdge || towns.has(end.x + end.y * w) || onRoad,
          `${name}, road ${i}: the end ${end.x},${end.y} is at the edge, a town or another road`,
        );
      }
    });
  }
});

test("a close-up draws the world's roads and none of its own weaving (Issue #952)", () => {
  const window = CAPITAL_WINDOWS[0] as UvWindow;
  const region = closeUp(HERO, window);
  const courses = HERO.roads
    .map((r) => inWindowCourse(r.points, HERO, window, GRID_W, GRID_H))
    .filter((c) => c.length > 0);
  const bound =
    corridorRadius(window, GRID_W, HERO.recipe.gridW) + harbourReachCells(GRID_W, window, HERO.recipe.gridW);
  assert.ok(
    courses.length > 0 && region.roads.length > 0,
    "precondition: roads cross the capital's band-1 window and are laid",
  );
  for (const [i, road] of region.roads.entries()) {
    for (const p of road.points) {
      const reach = Math.min(...courses.map((course) => distanceToPolyline(p, course)));
      assert.ok(
        reach <= bound,
        `road ${i}: cell ${p.x},${p.y} lies ${reach.toFixed(2)} cells from the chart's roads, over ${bound}`,
      );
    }
  }
});
