import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { buildChainedField } from "../../src/world/detail-chain.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { snapToLand } from "../../src/world/snap-to-land.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";

const world = generateWorld(defaultRecipe(2));
const window = lodWindowFor(0.5625, 0.4375, 0.125); // a band-3 window with a real coast in it
const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH - 1);
const spec = { window, gridW: 320, gridH: 240, title: "Detail Environs" };

test("with no detail asked for, the region draws exactly the bare heightfield it always did", () => {
  const region = generateRegionWorld(world, spec);
  const bare = buildHeightfield({
    seed: world.recipe.seed,
    gridW: 320,
    gridH: 240,
    mapType: world.recipe.mapType,
    window,
    worldAspect,
  });
  assert.deepEqual(Array.from(region.elev.data), Array.from(bare.data));
});

test("detail: true draws the chained field, cell for cell", () => {
  const region = generateRegionWorld(world, { ...spec, detail: true });
  const chained = buildChainedField({
    seed: world.recipe.seed,
    mapType: world.recipe.mapType,
    window,
    gridW: 320,
    gridH: 240,
    worldAspect,
    seaLevel: world.seaLevel,
  });
  assert.deepEqual(Array.from(region.elev.data), Array.from(chained.data));
  assert.notDeepEqual(
    Array.from(region.elev.data),
    Array.from(generateRegionWorld(world, spec).elev.data),
    "the two arms must actually differ, or this suite is measuring the flag being ignored",
  );
});

/** Replaces the settlement list with one town at a chosen region cell, so the projection can be aimed. */
function townAt(base: World, gx: number, gy: number): World {
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const town: NamedSettlement = {
    x: Math.round((window.u0 + (gx / 319) * du) * (base.recipe.gridW - 1)),
    y: Math.round((window.v0 + (gy / 239) * dv) * (base.recipe.gridH - 1)),
    kind: "town",
    harbor: false,
    onRiver: false,
    score: 1,
    name: "Testholm",
    founded: 100,
    ruined: false,
  };
  return { ...base, settlements: [town], realms: { ...base.realms, seats: [0] } };
}

test("a settlement a few cells offshore is walked to the new shore, not dropped", () => {
  const field = generateRegionWorld(world, spec).elev;
  // A water cell whose nearest land is out of the old 8-neighbour reach but inside the band's:
  // at radius 1 this settlement is dropped outright, at the band radius it lands.
  let target: { x: number; y: number } | null = null;
  for (let gy = 40; gy < 200 && target === null; gy++) {
    for (let gx = 40; gx < 280; gx++) {
      if ((field.data[gx + gy * 320] as number) > world.seaLevel) continue;
      if (snapToLand(field, world.seaLevel, gx, gy, 1) !== null) continue;
      if (snapToLand(field, world.seaLevel, gx, gy, 8) === null) continue;
      target = { x: gx, y: gy };
      break;
    }
  }
  assert.ok(target, "the fixture window has a cell in the old blind spot");
  const doctored = townAt(world, target.x, target.y);
  const town = doctored.settlements[0]!;
  const projX = Math.round(
    ((town.x / (world.recipe.gridW - 1) - window.u0) / (window.u1 - window.u0)) * 319,
  );
  const projY = Math.round(
    ((town.y / (world.recipe.gridH - 1) - window.v0) / (window.v1 - window.v0)) * 239,
  );
  const region = generateRegionWorld(doctored, spec);
  const towns = region.settlements.filter((s) => s.kind !== "hamlet");
  assert.equal(towns.length, 1, "the settlement survives the projection");
  const placed = towns[0]!;
  assert.ok(
    (region.elev.data[placed.x + placed.y * 320] as number) > region.seaLevel,
    "and it stands on land",
  );
  assert.ok(
    Math.max(Math.abs(placed.x - projX), Math.abs(placed.y - projY)) <= 8,
    "within one parent cell of where the world chart put it",
  );
  assert.equal(region.realms.seats[0], 0, "its realm keeps its seat rather than going to -1");
});

test("a settlement with no shore in reach is named in a warning, never dropped in silence", () => {
  const field = generateRegionWorld(world, spec).elev;
  let target: { x: number; y: number } | null = null;
  for (let gy = 40; gy < 200 && target === null; gy++) {
    for (let gx = 40; gx < 280; gx++) {
      if ((field.data[gx + gy * 320] as number) > world.seaLevel) continue;
      if (snapToLand(field, world.seaLevel, gx, gy, 8) !== null) continue;
      target = { x: gx, y: gy };
      break;
    }
  }
  assert.ok(target, "the fixture window has open water");
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]): void => {
    warnings.push(args.map(String).join(" "));
  };
  try {
    const region = generateRegionWorld(townAt(world, target.x, target.y), spec);
    assert.equal(
      region.settlements.filter((s) => s.kind !== "hamlet").length,
      0,
      "it really was dropped",
    );
  } finally {
    console.warn = original;
  }
  assert.equal(warnings.length, 1, "exactly one warning per region build, not one per settlement");
  assert.match(warnings[0]!, /Testholm/, "the warning names the settlement that was lost");
  assert.match(warnings[0]!, /Detail Environs/, "and the sheet it was lost from");
});
