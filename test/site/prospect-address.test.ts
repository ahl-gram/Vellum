import test from "node:test";
import assert from "node:assert/strict";
import {
  parseProspectAddress,
  chartTarget,
  parseYear,
  ribbonTarget,
  yearHash,
} from "../../src/site/prospect/address.ts";
// Issue #634 moved tableHash to the table's own grammar, since the Explorer's road to the Portfolio now builds its address the same way the Prospect page builds its own.
import { tableHash } from "../../src/site/shared/table-address.ts";
import { NOT_A_SEED, NOT_A_YEAR } from "../../test-support/hash-grammar-fixtures.ts";

test("parseProspectAddress reads the Explorer's world keys plus i and year", () => {
  const a = parseProspectAddress("#seed=42&style=ink&type=citystate&band=polar&land=350&coast=55&i=3&year=814");
  assert.deepEqual(a, {
    seed: 42,
    style: "ink",
    type: "citystate",
    band: "polar",
    land: 0.35,
    coast: 0.55,
    shape: {},
    index: 3,
    year: 814,
  });
});

test("parseProspectAddress: absent keys are null and never default to zero (presence-gating, the Number(null)===0 trap)", () => {
  const a = parseProspectAddress("");
  assert.deepEqual(a, {
    seed: null,
    style: null,
    type: null,
    band: null,
    land: null,
    coast: null,
    shape: {},
    index: null,
    year: null,
  });
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
  assert.equal(
    parseProspectAddress("#year=1e3").year,
    null,
    "the address and the year control share ONE grammar, digits only: a Number() reading here let 1e21 into a field the control could never resubmit (skeptic round 3 on PR #500)",
  );
  assert.equal(parseProspectAddress("#year=0300").year, 300);
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

test("ribbonTarget offers the road from this town: the world's keys verbatim, the page's own i and year dropped, a= the town", () => {
  assert.equal(
    ribbonTarget("#seed=7&style=antique&band=temperate&cx=0.5100&i=4&year=300", 4),
    "/ribbon/#seed=7&style=antique&band=temperate&cx=0.5100&a=4",
  );
  assert.equal(ribbonTarget("#i=2", 2), "/ribbon/#a=2");
  assert.equal(ribbonTarget("", 0), "/ribbon/#a=0", "a bare visit still names the town");
  assert.equal(
    ribbonTarget("#band=polar&i=1", 1),
    "/ribbon/#band=polar&a=1",
    "band survives, not being the journey's b",
  );
  assert.equal(
    ribbonTarget("#seed=42&a=5&b=3&i=1", 1),
    "/ribbon/#seed=42&a=1",
    "a hand-shared hash already carrying the Ribbon's keys loses them, or the first a= wins on parse (skeptic on PR #500)",
  );
});

test("parseYear reads a typed year: digits making a positive whole number, or nothing", () => {
  assert.equal(parseYear("812"), 812);
  assert.equal(parseYear(" 1059 "), 1059, "surrounding space is the typist's, not the year's");
  assert.equal(parseYear("1"), 1);
  for (const bad of NOT_A_YEAR) assert.equal(parseYear(bad), null, `${JSON.stringify(bad)} is not a year`);
  assert.equal(parseYear("0300"), 300, "leading zeros read as the number");
  assert.equal(parseYear("999999999"), 999999999, "nine digits is the ceiling");
  assert.equal(
    parseYear("1000000000000000000000"),
    null,
    "past it the number would write itself as 1e+21, which the address cannot read back (skeptic on PR #500)",
  );
});

test("PA1 tableHash replaces the table key in place and keeps every other key verbatim, so filing on this page never re-serializes the world (#522, the #321 rule)", () => {
  const SHEET = "k-p.seed-42.style-ink.i-3.year-814";
  assert.equal(tableHash("#seed=7&i=4&year=300", SHEET), `#seed=7&i=4&year=300&table=${SHEET}`);
  assert.equal(
    tableHash(`#seed=7&table=${SHEET}&i=4`, `${SHEET}_k-p.seed-7.style-antique.i-0.year-9`),
    `#seed=7&i=4&table=${SHEET}_k-p.seed-7.style-antique.i-0.year-9`,
    "a second filing replaces the key rather than appending a second one",
  );
  assert.equal(
    tableHash("#note=a%20b&flag", SHEET),
    `#note=a%20b&flag&table=${SHEET}`,
    "a valueless key and an encoded value survive verbatim",
  );
  assert.equal(tableHash("", SHEET), `#table=${SHEET}`);
});

test("PA2 an emptied table writes NO key at all, the rule emitTableKey already keeps, so a bare address stays bare (#522)", () => {
  assert.equal(
    tableHash("#table=k-p.seed-42.style-ink.i-3.year-814", ""),
    "",
    "the last sheet leaving takes the key with it",
  );
  assert.equal(tableHash("#seed=7&table=k-p.seed-42.style-ink.i-3.year-814", ""), "#seed=7");
  assert.equal(tableHash("", ""), "");
});

test("yearHash replaces or adds the year and keeps every other key, i included, untouched", () => {
  assert.equal(yearHash("#seed=7&i=4&year=300", 812), "#seed=7&i=4&year=812");
  assert.equal(yearHash("#seed=7&i=4", 812), "#seed=7&i=4&year=812");
  assert.equal(yearHash("", 5), "#year=5");
  assert.equal(
    yearHash("#note=a%20b&flag&year=1", 2),
    "#note=a%20b&flag&year=2",
    "a valueless key and an encoded value survive verbatim",
  );
});

test("parseProspectAddress reads seed and i by the seed's grammar: nothing but a run of digits is a number (Issue #1003)", () => {
  for (const raw of NOT_A_SEED) {
    const v = encodeURIComponent(raw);
    const a = parseProspectAddress(`#seed=${v}&i=${v}`);
    assert.deepEqual([a.seed, a.index], [null, null], JSON.stringify(raw));
  }
  const padded = parseProspectAddress("#seed=0300&i=07");
  assert.deepEqual([padded.seed, padded.index], [300, 7], "leading zeros read as the number");
});

test("parseProspectAddress reads land and coast by the seed's grammar, so an empty land= is no land (Issue #1003)", () => {
  for (const raw of NOT_A_SEED) {
    const v = encodeURIComponent(raw);
    const a = parseProspectAddress(`#land=${v}&coast=${v}`);
    assert.deepEqual([a.land, a.coast], [null, null], JSON.stringify(raw));
  }
  const padded = parseProspectAddress("#land=0350&coast=055");
  assert.deepEqual([padded.land, padded.coast], [0.35, 0.55]);
});

test("the Prospect address reads the shape keys", () => {
  assert.deepEqual(parseProspectAddress("#seed=42&type=archipelago&islands=12&isleSize=varied").shape, {
    islands: 12,
    isleSize: "varied",
  });
});
