import test from "node:test";
import assert from "node:assert/strict";
import { parseProspectAddress, chartTarget } from "../../src/site/prospect/address.ts";

test("parseProspectAddress reads the Explorer's world keys plus i and year", () => {
  const a = parseProspectAddress("#seed=42&style=ink&type=citystate&band=polar&land=350&coast=55&i=3&year=814");
  assert.deepEqual(a, {
    seed: 42,
    style: "ink",
    type: "citystate",
    band: "polar",
    land: 0.35,
    coast: 0.55,
    index: 3,
    year: 814,
  });
});

test("parseProspectAddress: absent keys are null and never default to zero (presence-gating, the Number(null)===0 trap)", () => {
  const a = parseProspectAddress("");
  assert.deepEqual(a, { seed: null, style: null, type: null, band: null, land: null, coast: null, index: null, year: null });
  assert.equal(parseProspectAddress("#seed=0&i=0").seed, 0, "an explicit 0 is a real seed");
  assert.equal(parseProspectAddress("#seed=0&i=0").index, 0, "an explicit 0 is a real index");
});

test("parseProspectAddress: invalid values are ignored, not guessed at", () => {
  assert.equal(parseProspectAddress("#style=gothic").style, null, "an unknown style is refused");
  assert.equal(parseProspectAddress("#type=moon").type, null);
  assert.equal(parseProspectAddress("#band=arid").band, null);
  assert.equal(parseProspectAddress("#year=0").year, null, "year 0 is invalid, matching the room's grammar");
  assert.equal(parseProspectAddress("#year=-5").year, null);
  assert.equal(parseProspectAddress("#year=8.5").year, null);
  assert.equal(parseProspectAddress("#i=-1").index, null);
  assert.equal(parseProspectAddress("#i=abc").index, null);
  assert.equal(parseProspectAddress("#seed=-3").seed, null);
});

test("parseProspectAddress: land and coast decode with the Explorer's encodings and clamp to the engine's range", () => {
  assert.equal(parseProspectAddress("#land=9999").land, 0.7, "a crafted land value clamps at the CLI's own ceiling");
  assert.equal(parseProspectAddress("#land=10").land, 0.1, "and at its floor");
  assert.equal(parseProspectAddress("#coast=500").coast, 1, "coast clamps to [0, 1]");
  assert.equal(parseProspectAddress("#coast=0").coast, 0);
});

test("chartTarget keeps the world's keys byte-for-byte and drops only i and year (#321: never re-serialize)", () => {
  assert.equal(
    chartTarget("#seed=7&style=antique&cx=0.5100&k=3.0000&flag&note=a%20b&i=4&year=300"),
    "/explorer/#seed=7&style=antique&cx=0.5100&k=3.0000&flag&note=a%20b",
  );
  assert.equal(chartTarget("#i=4"), "/explorer/");
  assert.equal(chartTarget(""), "/explorer/");
});
