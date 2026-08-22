import test from "node:test";
import assert from "node:assert/strict";
import { parseRibbonAddress, chartTarget, journeyHash } from "../../src/site/ribbon/address.ts";

// #427 item 4: the ribbon's address grammar, mirroring its exact sibling
// test/site/prospect-address.test.ts. The one thing the sibling cannot cover is the `band`
// collision: the ribbon drops `a` and `b` and the Explorer's own `band` key starts with a `b`.

test("parseRibbonAddress reads the Explorer's world keys plus a and b", () => {
  const a = parseRibbonAddress("#seed=42&style=ink&type=citystate&band=polar&land=350&coast=55&a=3&b=9");
  assert.deepEqual(a, {
    seed: 42,
    style: "ink",
    type: "citystate",
    band: "polar",
    land: 0.35,
    coast: 0.55,
    from: 3,
    to: 9,
  });
});

test("parseRibbonAddress: absent keys are null and never default to zero (presence-gating, the Number(null)===0 trap)", () => {
  assert.deepEqual(parseRibbonAddress(""), {
    seed: null,
    style: null,
    type: null,
    band: null,
    land: null,
    coast: null,
    from: null,
    to: null,
  });
  assert.equal(parseRibbonAddress("#seed=0&a=0&b=0").seed, 0, "an explicit 0 is a real seed");
  assert.equal(parseRibbonAddress("#seed=0&a=0&b=0").from, 0, "settlement 0 is a real settlement");
  assert.equal(parseRibbonAddress("#seed=0&a=0&b=0").to, 0);
});

test("parseRibbonAddress: invalid values are ignored, not guessed at", () => {
  assert.equal(parseRibbonAddress("#style=gothic").style, null, "an unknown style is refused");
  assert.equal(parseRibbonAddress("#type=moon").type, null);
  assert.equal(parseRibbonAddress("#band=arid").band, null);
  assert.equal(parseRibbonAddress("#a=-1").from, null, "a negative settlement is refused");
  assert.equal(parseRibbonAddress("#b=-1").to, null);
  assert.equal(parseRibbonAddress("#a=abc").from, null);
  assert.equal(parseRibbonAddress("#b=2.5").to, null, "a settlement index is a whole number");
  assert.equal(parseRibbonAddress("#seed=-3").seed, null);
  // land and coast go through a different helper from the whole-number keys, and it is the only
  // one that can be handed a NaN: Math.min/max propagate it silently into the engine's range.
  assert.equal(parseRibbonAddress("#land=abc").land, null, "a non-numeric land is refused, not passed as NaN");
  assert.equal(parseRibbonAddress("#coast=abc").coast, null);
});

test("parseRibbonAddress: land and coast decode with the Explorer's encodings and clamp to the engine's range", () => {
  assert.equal(parseRibbonAddress("#land=9999").land, 0.7, "a crafted land value clamps at the CLI's own ceiling");
  assert.equal(parseRibbonAddress("#land=10").land, 0.1, "and at its floor");
  assert.equal(parseRibbonAddress("#coast=500").coast, 1, "coast clamps to [0, 1]");
  assert.equal(parseRibbonAddress("#coast=0").coast, 0);
});

test("chartTarget keeps the world's keys byte-for-byte and drops only a and b (#321: never re-serialize)", () => {
  assert.equal(
    chartTarget("#seed=7&style=antique&cx=0.5100&k=3.0000&flag&note=a%20b&a=4&b=9"),
    "/explorer/#seed=7&style=antique&cx=0.5100&k=3.0000&flag&note=a%20b",
  );
  assert.equal(chartTarget("#a=4&b=9"), "/explorer/");
  assert.equal(chartTarget(""), "/explorer/");
});

test("chartTarget keeps band, which starts with the b it drops", () => {
  assert.equal(
    chartTarget("#band=temperate&a=1&b=2"),
    "/explorer/#band=temperate",
    "band is a world key, not the journey's b",
  );
  assert.equal(chartTarget("#a=1&band=polar"), "/explorer/#band=polar");
});

test("journeyHash replaces a and b and keeps every other key untouched", () => {
  assert.equal(
    journeyHash("#seed=7&style=antique&band=temperate&a=1&b=2", 4, 9),
    "#seed=7&style=antique&band=temperate&a=4&b=9",
  );
  assert.equal(journeyHash("", 0, 3), "#a=0&b=3", "an empty address still names the journey");
  assert.equal(
    journeyHash("#note=a%20b&flag", 1, 2),
    "#note=a%20b&flag&a=1&b=2",
    "a valueless key and an encoded value survive verbatim",
  );
});
