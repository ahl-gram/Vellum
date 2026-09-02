import test from "node:test";
import assert from "node:assert/strict";
import { parseProspectAddress, chartTarget, parseYear, ribbonTarget, yearHash } from "../../src/site/prospect/address.ts";

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

// #463 part 4/4: the room's roads out and its year control write the address, never re-serializing the world's keys (#321).
test("ribbonTarget offers the road from this town: the world's keys verbatim, the page's own i and year dropped, a= the town", () => {
  assert.equal(
    ribbonTarget("#seed=7&style=antique&band=temperate&cx=0.5100&i=4&year=300", 4),
    "/ribbon/#seed=7&style=antique&band=temperate&cx=0.5100&a=4",
  );
  assert.equal(ribbonTarget("#i=2", 2), "/ribbon/#a=2");
  assert.equal(ribbonTarget("", 0), "/ribbon/#a=0", "a bare visit still names the town");
  assert.equal(ribbonTarget("#band=polar&i=1", 1), "/ribbon/#band=polar&a=1", "band survives, not being the journey's b");
});

test("parseYear reads the control the way the address reads year=: a positive whole number, or nothing", () => {
  assert.equal(parseYear("812"), 812);
  assert.equal(parseYear(" 1059 "), 1059, "surrounding space is the typist's, not the year's");
  assert.equal(parseYear("1"), 1);
  for (const bad of ["", "0", "-5", "8.5", "abc", "12a", "1e3"]) assert.equal(parseYear(bad), null, `${JSON.stringify(bad)} is not a year`);
  assert.equal(parseYear("0300"), 300, "leading zeros read as the number");
});

test("yearHash replaces or adds the year and keeps every other key, i included, untouched", () => {
  assert.equal(yearHash("#seed=7&i=4&year=300", 812), "#seed=7&i=4&year=812");
  assert.equal(yearHash("#seed=7&i=4", 812), "#seed=7&i=4&year=812");
  assert.equal(yearHash("", 5), "#year=5");
  assert.equal(yearHash("#note=a%20b&flag&year=1", 2), "#note=a%20b&flag&year=2", "a valueless key and an encoded value survive verbatim");
});
