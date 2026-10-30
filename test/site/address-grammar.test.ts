import test from "node:test";
import assert from "node:assert/strict";
import {
  CLIMATE_BANDS,
  MAP_TYPES,
  STYLE_NAMES,
  coastFromAddress,
  emitLandKeys,
  landFromAddress,
  oneOf,
  overridesOfLand,
  readDressKeys,
  readWorldKeys,
} from "../../src/site/shared/address-grammar.ts";
import { NOT_A_SEED } from "../../test-support/hash-grammar-fixtures.ts";

test("readWorldKeys reads the world keys every room carries", () => {
  const k = readWorldKeys(new URLSearchParams("seed=42&style=ink&type=citystate&band=polar&land=350&coast=55"));
  assert.deepEqual(k, { seed: 42, style: "ink", type: "citystate", band: "polar", land: 0.35, coast: 0.55, shape: {} });
});

test("readWorldKeys: absent keys are null and never default to zero (presence-gating, the Number(null)===0 trap)", () => {
  const k = readWorldKeys(new URLSearchParams(""));
  assert.deepEqual(Object.values(k), [null, null, null, null, null, null, {}]);
  assert.equal(readWorldKeys(new URLSearchParams("seed=0")).seed, 0, "an explicit 0 is a real seed");
});

test("readWorldKeys reads seed, land and coast by the seed's grammar: nothing but a run of digits is a number (Issue #1003)", () => {
  for (const raw of NOT_A_SEED) {
    const k = readWorldKeys(
      new URLSearchParams([
        ["seed", raw],
        ["land", raw],
        ["coast", raw],
      ]),
    );
    assert.deepEqual([k.seed, k.land, k.coast], [null, null, null], JSON.stringify(raw));
  }
  assert.equal(readWorldKeys(new URLSearchParams("land=0350")).land, 0.35, "leading zeros read as the number");
});

test("readWorldKeys carries the shape keys, and leaves out a land and a coast that draw nothing beside them", () => {
  const shaped = readWorldKeys(new URLSearchParams("seed=42&type=island&outline=round&looseness=50&land=350&coast=55"));
  assert.deepEqual([shaped.shape, shaped.land, shaped.coast], [{ outline: "round", looseness: 0.5 }, null, 0.55]);
  const counted = readWorldKeys(new URLSearchParams("type=archipelago&islands=12&land=350&coast=55"));
  assert.deepEqual([counted.land, counted.coast], [null, null]);
  assert.equal(readWorldKeys(new URLSearchParams("outline=round&coast=55")).coast, null);
});

test("a refused shape reads as absent: the link draws the seed's own world, as an unknown type does", () => {
  const k = readWorldKeys(new URLSearchParams("islands=12&land=350"));
  assert.deepEqual([k.shape, k.land], [{}, 0.35]);
});

test("emitLandKeys writes land, coast and the shape in that order, and overridesOfLand draws the same", () => {
  const write = (keys: Parameters<typeof emitLandKeys>[1]): string => {
    const p = new URLSearchParams();
    emitLandKeys(p, keys);
    return p.toString();
  };
  assert.equal(write({ land: 0.35, coast: 0.55, shape: {} }), "land=350&coast=55");
  const shaped = { land: null, coast: 0.55, shape: { outline: "round", looseness: 0.5 } } as const;
  assert.equal(write(shaped), "coast=55&outline=round&looseness=50");
  assert.deepEqual(overridesOfLand(shaped), { coastWarp: 0.55, outline: "round", looseness: 0.5 });
});

test("readWorldKeys reads style, type and band only from the house's lists", () => {
  assert.equal(readWorldKeys(new URLSearchParams("style=gothic")).style, null);
  assert.equal(readWorldKeys(new URLSearchParams("type=moon")).type, null);
  assert.equal(readWorldKeys(new URLSearchParams("band=arid")).band, null);
  for (const style of ["antique", "topographic", "ink", "nautical"])
    assert.equal(readWorldKeys(new URLSearchParams(`style=${style}`)).style, style);
  for (const type of ["island", "archipelago", "continent", "citystate"])
    assert.equal(readWorldKeys(new URLSearchParams(`type=${type}`)).type, type);
  for (const band of ["temperate", "tropical", "polar"])
    assert.equal(readWorldKeys(new URLSearchParams(`band=${band}`)).band, band);
});

test("landFromAddress and coastFromAddress clamp to the engine's range", () => {
  assert.equal(landFromAddress("9999"), 0.7);
  assert.equal(landFromAddress("10"), 0.1);
  assert.equal(coastFromAddress("500"), 1);
  assert.equal(coastFromAddress("0"), 0);
  assert.equal(landFromAddress(null), null);
  assert.equal(coastFromAddress(null), null);
});

test("readDressKeys: the theme from its list, and a dress flag on only when it reads 1", () => {
  const none = readDressKeys(new URLSearchParams(""));
  assert.deepEqual(Object.values(none), [null, null, null, null]);
  assert.equal(readDressKeys(new URLSearchParams("theme=moisture")).theme, "moisture");
  assert.equal(readDressKeys(new URLSearchParams("theme=altitude")).theme, null);
  const on = readDressKeys(new URLSearchParams("legend=1&arms=1&beasts=1"));
  assert.deepEqual([on.legend, on.arms, on.beasts], [true, true, true]);
  const off = readDressKeys(new URLSearchParams("legend=0&arms=0&beasts=0"));
  assert.deepEqual([off.legend, off.arms, off.beasts], [false, false, false]);
  assert.equal(readDressKeys(new URLSearchParams("legend=yes")).legend, false);
});

test("oneOf: a value in the list, or nothing", () => {
  assert.equal(oneOf("ink", STYLE_NAMES), "ink");
  assert.equal(oneOf("gothic", STYLE_NAMES), null);
  assert.equal(oneOf("", MAP_TYPES), null);
  assert.equal(oneOf(null, CLIMATE_BANDS), null);
});
