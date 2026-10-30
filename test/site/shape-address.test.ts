import test from "node:test";
import assert from "node:assert/strict";
import {
  SHAPE_KEYS,
  coastDraws,
  drawnShape,
  landDraws,
  readShapeKeys,
  shapePairs,
  type ShapeKey,
  type ShapeOverrides,
} from "../../src/site/shared/shape-address.ts";
import type { MapType } from "../../src/terrain/heightfield.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { placeId } from "../../src/world/outline-ids.ts";

const TEXAS = placeId("ne-1159315211");

const MAP_TYPE_WORDS: readonly string[] = ["island", "archipelago", "continent", "citystate"];

function read(query: string): ShapeOverrides | null {
  const p = new URLSearchParams(query);
  const type = p.get("type");
  return readShapeKeys((k: ShapeKey) => p.get(k), MAP_TYPE_WORDS.includes(type ?? "") ? (type as MapType) : null);
}

test("readShapeKeys reads a shaped world: a form, a real place, and a looseness in hundredths", () => {
  assert.deepEqual(read("outline=round"), { outline: "round" });
  assert.deepEqual(read(`type=island&outline=${TEXAS}&looseness=67`), { outline: TEXAS, looseness: 0.67 });
});

test("readShapeKeys reads a counted world beside type=archipelago", () => {
  assert.deepEqual(read("type=archipelago&islands=12&isleSize=varied&raggedness=40"), {
    islands: 12,
    isleSize: "varied",
    raggedness: 0.4,
  });
});

test("the engine's defaults are spelt by leaving them out", () => {
  assert.deepEqual(read("outline=round&looseness=0"), { outline: "round" });
  assert.deepEqual(read("type=archipelago&islands=12&raggedness=0&isleSize=equal"), { islands: 12 });
});

test("a shape the engine would refuse reads as null, whole", () => {
  const refused = [
    "outline=ne-0000000001",
    "outline=texas",
    "outline=",
    "outline=round&looseness=abc",
    "outline=round&looseness=4.5",
    "looseness=50",
    "type=archipelago&islands=1",
    "type=archipelago&islands=101",
    "type=archipelago&islands=2.5",
    "islands=12",
    "type=island&islands=12",
    "type=archipelago&islands=12&outline=round",
    "type=archipelago&islands=12&isleSize=huge",
    "isleSize=varied",
    "raggedness=40",
  ];
  for (const query of refused) assert.equal(read(query), null, query);
});

test("looseness and raggedness clamp at 1, as the coast does", () => {
  assert.equal(read("outline=round&looseness=150")?.looseness, 1);
  assert.equal(read("type=archipelago&islands=3&raggedness=999")?.raggedness, 1);
});

test("shapePairs writes the keys in one order, and reading them back gives the same shape", () => {
  const first: ShapeOverrides = { outline: TEXAS, looseness: 0.29 };
  assert.deepEqual(shapePairs(first), [
    ["outline", TEXAS],
    ["looseness", "29"],
  ]);
  const shapes: ShapeOverrides[] = [
    first,
    { outline: "crescent", looseness: 1 },
    { islands: 100, isleSize: "varied", raggedness: 0.01 },
  ];
  for (const shape of shapes) {
    const pairs = shapePairs(shape);
    const order = pairs.map(([k]) => SHAPE_KEYS.indexOf(k));
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b),
    );
    const query = new URLSearchParams(pairs as [string, string][]);
    if (shape.islands !== undefined) query.set("type", "archipelago");
    assert.deepEqual(read(query.toString()), shape);
  }
});

test("drawnShape drops a count off the archipelago, keeps an outline on every type, and spells the defaults", () => {
  assert.deepEqual(drawnShape({ islands: 12, isleSize: "varied" }, "island"), {});
  assert.deepEqual(drawnShape({ islands: 12, isleSize: "varied" }, "archipelago"), { islands: 12, isleSize: "varied" });
  assert.deepEqual(drawnShape({ outline: "round", looseness: 0 }, "continent"), { outline: "round" });
  assert.deepEqual(drawnShape({ outline: "round", islands: 5 }, "archipelago"), { outline: "round" });
});

test("landDraws and coastDraws follow what the world draws", () => {
  const shapes: ShapeOverrides[] = [{}, { outline: "round" }, { outline: "round", looseness: 0.5 }, { islands: 12 }];
  assert.deepEqual(shapes.map(landDraws), [true, false, false, false]);
  assert.deepEqual(shapes.map(coastDraws), [true, false, true, false]);
});

const GRID = { gridW: 160, gridH: 120 } as const;
const world = (seed: number, o: Parameters<typeof defaultRecipe>[1]) =>
  generateWorld(defaultRecipe(seed, { ...GRID, ...o }));
const same = (a: ReturnType<typeof world>, b: ReturnType<typeof world>) =>
  a.seaLevel === b.seaLevel && a.elev.data.every((v, i) => v === b.elev.data[i]);

test("a land fraction draws nothing on a shaped or counted world, and a coast warp nothing on a counted world or a shape held exact, but it does on a loosened shape", () => {
  const round = { mapType: "island", outline: "round" } as const;
  for (const looseness of [undefined, 1])
    assert.ok(
      same(
        world(30, { ...round, looseness, landFraction: 0.1 }),
        world(30, { ...round, looseness, landFraction: 0.7 }),
      ),
      `land at looseness ${looseness}`,
    );
  assert.ok(same(world(30, { ...round, coastWarp: 0 }), world(30, { ...round, coastWarp: 1 })), "coast held exact");
  assert.ok(
    !same(world(30, { ...round, looseness: 0.5, coastWarp: 0 }), world(30, { ...round, looseness: 0.5, coastWarp: 1 })),
    "coast on a loosened shape",
  );
  const counted = { mapType: "archipelago", islands: 20 } as const;
  assert.ok(
    same(world(1, { ...counted, landFraction: 0.1 }), world(1, { ...counted, landFraction: 0.7 })),
    "land counted",
  );
  assert.ok(same(world(1, { ...counted, coastWarp: 0 }), world(1, { ...counted, coastWarp: 1 })), "coast counted");
});
