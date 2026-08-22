import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { buildChainedField } from "../../src/world/detail-chain.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { FULL_WINDOW, lodWindowFor } from "../../src/world/lod.ts";
import { mouthReachCells } from "../../src/world/region-rivers.ts";
import { snapToLand } from "../../src/world/snap-to-land.ts";
import { createField, type Field } from "../../src/core/grid.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";

/** deepEqual on two broadly differing 76,800-cell fields takes 11s and builds a 2MB message, which is what a real routing regression produces; this reports the first differing cell instead. */
function firstDifference(a: Field, b: Field): string | null {
  if (a.data.length !== b.data.length) return `lengths ${a.data.length} vs ${b.data.length}`;
  for (let i = 0; i < a.data.length; i++) {
    if ((a.data[i] as number) !== (b.data[i] as number)) {
      return `cell ${i % a.w},${(i / a.w) | 0}: ${a.data[i]} vs ${b.data[i]}`;
    }
  }
  return null;
}

const world = generateWorld(defaultRecipe(2));
const window = lodWindowFor(0.5625, 0.4375, 0.125); // a band-3 window with a real coast in it
const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH - 1);
const spec = { window, gridW: 320, gridH: 240, title: "Detail Environs" };

test("firstDifference reads from cell 0: the routing defect it guards diverges there", () => {
  const a = createField(2, 1, (x) => (x === 0 ? 1 : 5));
  const b = createField(2, 1, () => 5);
  assert.match(firstDifference(a, b) ?? "", /^cell 0,0:/);
  assert.equal(firstDifference(a, createField(2, 1, (x) => (x === 0 ? 1 : 5))), null);
});

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
  assert.equal(firstDifference(region.elev, bare), null);
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
  assert.equal(firstDifference(region.elev, chained), null);
  assert.notEqual(
    firstDifference(region.elev, generateRegionWorld(world, spec).elev),
    null,
    "the two arms must actually differ, or this suite is measuring the flag being ignored",
  );
});

function townsAt(base: World, cells: ReadonlyArray<{ x: number; y: number; name: string }>): World {
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const settlements: NamedSettlement[] = cells.map((c) => ({
    x: Math.round((window.u0 + (c.x / 319) * du) * (base.recipe.gridW - 1)),
    y: Math.round((window.v0 + (c.y / 239) * dv) * (base.recipe.gridH - 1)),
    kind: "town",
    harbor: false,
    onRiver: false,
    score: 1,
    name: c.name,
    founded: 100,
    ruined: false,
  }));
  return { ...base, settlements, realms: { ...base.realms, seats: [0] } };
}

/** `withinBand` picks the water cells the band radius rescues, its negation the ones nothing can. */
function offshoreCells(field: Field, withinBand: boolean, wanted: number): Array<{ x: number; y: number }> {
  const found: Array<{ x: number; y: number }> = [];
  for (let gy = 40; gy < 200 && found.length < wanted; gy++) {
    for (let gx = 40; gx < 280 && found.length < wanted; gx++) {
      if ((field.data[gx + gy * 320] as number) > world.seaLevel) continue;
      if (snapToLand(field, world.seaLevel, gx, gy, 1) !== null) continue;
      if ((snapToLand(field, world.seaLevel, gx, gy, 8) !== null) !== withinBand) continue;
      if (found.some((f) => Math.max(Math.abs(f.x - gx), Math.abs(f.y - gy)) < 24)) continue;
      found.push({ x: gx, y: gy });
    }
  }
  return found;
}

test("a settlement a few cells offshore is walked to the new shore, not dropped", () => {
  const field = generateRegionWorld(world, spec).elev;
  const target = offshoreCells(field, true, 1)[0];
  assert.ok(target, "the fixture window has a cell in the old blind spot");
  const doctored = townsAt(world, [{ ...target, name: "Testholm" }]);
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
  const targets = offshoreCells(field, false, 2);
  assert.equal(targets.length, 2, "the fixture window has two separate stretches of open water");
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]): void => {
    warnings.push(args.map(String).join(" "));
  };
  try {
    const region = generateRegionWorld(
      townsAt(world, [
        { ...targets[0]!, name: "Testholm" },
        { ...targets[1]!, name: "Drownwich" },
      ]),
      spec,
    );
    assert.equal(
      region.settlements.filter((s) => s.kind !== "hamlet").length,
      0,
      "both really were dropped",
    );
  } finally {
    console.warn = original;
  }
  assert.equal(warnings.length, 1, "exactly one warning per region build, not one per settlement");
  assert.match(warnings[0]!, /Testholm/, "the warning names every settlement that was lost");
  assert.match(warnings[0]!, /Drownwich/, "including the second one");
  assert.match(warnings[0]!, /Detail Environs/, "and the sheet they were lost from");
});

test("mouthReachCells is three parent cells, whatever the band scales that to", () => {
  const band = (size: number) => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
  assert.equal(mouthReachCells(320, band(0.5), 320), 6, "band 1");
  assert.equal(mouthReachCells(320, band(0.25), 320), 12, "band 2");
  assert.equal(mouthReachCells(320, band(0.125), 320), 24, "band 3");
  assert.equal(mouthReachCells(320, FULL_WINDOW, 320), 3, "the world window");
  assert.equal(mouthReachCells(320, { u0: 0.5, v0: 0.5, u1: 0.5, v1: 0.5 }, 320), 3, "degenerate");
});

// The two ways this sub reaches sheets Alex can already see, both on the BARE arm; scripts/region-detail-probes.ts sweeps the class these two name.
test("the band radius rescues a named hamlet on today's sheets (seed 42, Poakoa)", () => {
  const hero = generateWorld(defaultRecipe(42));
  const win = lodWindowFor(0.5625, 0.4375, 0.125);
  const region = generateRegionWorld(hero, { window: win, gridW: 320, gridH: 240, title: "Poakoa" });
  const poakoa = region.settlements.find((s) => s.name === "Poakoa");
  assert.ok(poakoa, "Poakoa is placed, where the old 8-neighbour scan dropped her");
  assert.ok((region.elev.data[poakoa.x + poakoa.y * 320] as number) > region.seaLevel);
  assert.equal(
    snapToLand(region.elev, region.seaLevel, 152, 70, 1),
    null,
    "and radius 1 genuinely cannot reach that shore, or this guard proves nothing",
  );
});

test("the mouth walk fires on today's sheets too (seed 15, band 1)", () => {
  const w15 = generateWorld(defaultRecipe(15));
  const win = lodWindowFor(0.25, 0.25, 0.5);
  const region = generateRegionWorld(w15, { window: win, gridW: 320, gridH: 240, title: "Mouths" });
  const ends = region.rivers.map((r) => r.points[r.points.length - 1]!);
  assert.ok(
    ends.some((p) => (region.elev.data[Math.round(p.x) + Math.round(p.y) * 320] as number) <= region.seaLevel),
    "at least one run reaches water",
  );
  assert.ok(
    !ends.some((p) => Math.round(p.x) === 262 && Math.round(p.y) === 81),
    "the mouth at (262,81) no longer stops on the land the parent charted as sea",
  );
});
