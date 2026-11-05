import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";

const world = generateWorld(defaultRecipe(42));
const beast = world.beasts[0]!;
const u = beast.x / (world.recipe.gridW - 1);
const v = beast.y / (world.recipe.gridH - 1);
const regionOf = (window: UvWindow) =>
  generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "A Survey" });

test("a close-up whose window holds the haunt carries the parent's beast, whole, on the window's own grid (seed 42, band 2)", () => {
  const band = LOD_BANDS[2]!;
  const q = quantizeCenter(u, v, band.sizeUV);
  const window = lodWindowFor(q.cx, q.cy, band.sizeUV);
  assert.equal(world.beasts.length, 1, "fixture drift: seed 42 no longer conjures its beast");
  const region = regionOf(window);
  assert.equal(region.beasts.length, 1);
  const { x, y, ...carried } = region.beasts[0]!;
  assert.deepEqual({ ...carried, x: beast.x, y: beast.y }, beast);
  assert.ok(Number.isInteger(x) && Number.isInteger(y), `the haunt (${x}, ${y}) is not a cell`);
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  assert.ok(
    Math.abs(window.u0 + (x / 319) * du - u) <= du / (2 * 319),
    `x ${x} is not the cell nearest the haunt across the window`,
  );
  assert.ok(
    Math.abs(window.v0 + (y / 239) * dv - v) <= dv / (2 * 239),
    `y ${y} is not the cell nearest the haunt down the window`,
  );
});

test("a close-up carries the beast exactly when the haunt lies inside its window, its edge included", () => {
  const miss = regionOf({ u0: u - 0.252, u1: u - 0.002, v0: 0.7, v1: 0.95 });
  const hold = regionOf({ u0: u - 0.248, u1: u + 0.002, v0: 0.7, v1: 0.95 });
  const far = regionOf(lodWindowFor(0.25, 0.25, 0.25));
  assert.equal(miss.beasts.length, 0, "a window that misses the haunt by a hair carried the beast");
  assert.equal(far.beasts.length, 0, "a window far from the haunt carried the beast");
  const missLeft = regionOf({ u0: u + 0.002, u1: u + 0.152, v0: v - 0.075, v1: v + 0.075 });
  const missAbove = regionOf({ u0: u - 0.075, u1: u + 0.075, v0: v - 0.152, v1: v - 0.002 });
  const missBelow = regionOf({ u0: u - 0.075, u1: u + 0.075, v0: v + 0.002, v1: v + 0.1 });
  assert.equal(missLeft.beasts.length, 0, "a window lying right of the haunt carried the beast");
  assert.equal(missAbove.beasts.length, 0, "a window lying above the haunt carried the beast");
  assert.equal(missBelow.beasts.length, 0, "a window lying below the haunt carried the beast");
  assert.equal(hold.beasts.length, 1, "a window holding the haunt near its edge lost the beast");
});
