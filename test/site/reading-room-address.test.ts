import test from "node:test";
import assert from "node:assert/strict";
import { parseReadingRoomAddress, roadHrefFor } from "../../src/site/reading-room/address.ts";
import { parseRibbonAddress } from "../../src/site/ribbon/address.ts";
import { NOT_A_SEED } from "../../test-support/hash-grammar-fixtures.ts";

const NONE = {
  seed: null,
  style: null,
  type: null,
  band: null,
  theme: null,
  legend: null,
  arms: null,
  beasts: null,
  land: null,
  coast: null,
  shape: {},
  table: null,
  live: null,
};

test("parseReadingRoomAddress reads every key the Reading Room carries", () => {
  const a = parseReadingRoomAddress(
    "#seed=42&style=ink&type=citystate&band=polar&theme=moisture&legend=0&arms=1&beasts=1&land=350&coast=55&table=k-p.seed-42.style-ink.i-3.year-814&year=814",
  );
  assert.deepEqual(a, {
    seed: 42,
    style: "ink",
    type: "citystate",
    band: "polar",
    theme: "moisture",
    legend: false,
    arms: true,
    beasts: true,
    land: 0.35,
    coast: 0.55,
    shape: {},
    table: "k-p.seed-42.style-ink.i-3.year-814",
    live: { kind: "year", year: 814 },
  });
});

test("parseReadingRoomAddress: absent keys are null and never default to zero (presence-gating, the Number(null)===0 trap)", () => {
  assert.deepEqual(parseReadingRoomAddress(""), NONE);
  assert.deepEqual(parseReadingRoomAddress("#"), NONE);
  assert.equal(parseReadingRoomAddress("#seed=0").seed, 0, "an explicit 0 is a real seed");
});

test("parseReadingRoomAddress: invalid values are ignored, not guessed at", () => {
  assert.equal(parseReadingRoomAddress("#style=gothic").style, null, "an unknown style is refused");
  assert.equal(parseReadingRoomAddress("#type=moon").type, null);
  assert.equal(parseReadingRoomAddress("#band=arid").band, null);
  assert.equal(parseReadingRoomAddress("#theme=altitude").theme, null);
  assert.equal(parseReadingRoomAddress("#land=abc").land, null);
  assert.equal(parseReadingRoomAddress("#coast=abc").coast, null);
});

test("parseReadingRoomAddress: land and coast decode with the Explorer's encodings and clamp to the engine's range", () => {
  assert.equal(parseReadingRoomAddress("#land=9999").land, 0.7, "a crafted land value clamps at the CLI's own ceiling");
  assert.equal(parseReadingRoomAddress("#land=10").land, 0.1, "and at its floor");
  assert.equal(parseReadingRoomAddress("#coast=500").coast, 1, "coast clamps to [0, 1]");
  assert.equal(parseReadingRoomAddress("#coast=0").coast, 0);
});

test("parseReadingRoomAddress: a dress flag is on only when it reads 1", () => {
  const on = parseReadingRoomAddress("#legend=1&arms=1&beasts=1");
  assert.deepEqual([on.legend, on.arms, on.beasts], [true, true, true]);
  const off = parseReadingRoomAddress("#legend=0&arms=0&beasts=0");
  assert.deepEqual([off.legend, off.arms, off.beasts], [false, false, false]);
  assert.equal(parseReadingRoomAddress("#legend=yes").legend, false);
});

test("parseReadingRoomAddress: the table rides as written, unread", () => {
  assert.equal(parseReadingRoomAddress("#seed=7&table=anything").table, "anything");
});

test("parseReadingRoomAddress reads the seed by the seed's grammar: nothing but a run of digits is a seed (Issue #1003)", () => {
  for (const raw of NOT_A_SEED)
    assert.equal(parseReadingRoomAddress(`#seed=${encodeURIComponent(raw)}`).seed, null, JSON.stringify(raw));
  assert.equal(parseReadingRoomAddress("#seed=0300").seed, 300, "leading zeros read as the number");
});

test("parseReadingRoomAddress reads land and coast by the seed's grammar, so an empty land= is no land (Issue #1003)", () => {
  for (const raw of NOT_A_SEED) {
    const v = encodeURIComponent(raw);
    const a = parseReadingRoomAddress(`#land=${v}&coast=${v}`);
    assert.deepEqual([a.land, a.coast], [null, null], JSON.stringify(raw));
  }
  const padded = parseReadingRoomAddress("#land=0350&coast=055");
  assert.deepEqual([padded.land, padded.coast], [0.35, 0.55]);
});

test("parseReadingRoomAddress reads the live key by the Explorer's grammar", () => {
  assert.deepEqual(parseReadingRoomAddress("#survey").live, { kind: "survey" });
  assert.deepEqual(parseReadingRoomAddress("#seed=42&year=814").live, { kind: "year", year: 814 });
  assert.equal(parseReadingRoomAddress("#year=1e3").live, null);
});

test("the Reading Room address reads the shape keys", () => {
  assert.deepEqual(parseReadingRoomAddress("#seed=42&type=archipelago&islands=12&isleSize=varied").shape, {
    islands: 12,
    isleSize: "varied",
  });
});

const ROAD_WORLD = {
  style: "ink",
  type: "citystate",
  band: "polar",
  keys: { land: 0.35, coast: 0.55, shape: {} },
  table: "k-p.seed-42.style-ink.i-3.year-814",
  written: null,
} as const;

test("roadHrefFor writes the world, the Chart Table and the leg, and none of the look or live keys (#434 ruling C)", () => {
  const href = roadHrefFor(ROAD_WORLD, 42, 3, 7);
  assert.ok(href.startsWith("/ribbon/#"));
  assert.deepEqual(
    [...new URLSearchParams(href.slice(9)).keys()],
    ["seed", "style", "type", "band", "land", "coast", "table", "a", "b"],
  );
  const r = parseRibbonAddress(href.slice(8));
  assert.deepEqual(
    { seed: r.seed, style: r.style, type: r.type, band: r.band, land: r.land, coast: r.coast, from: r.from, to: r.to },
    { seed: 42, style: "ink", type: "citystate", band: "polar", land: 0.35, coast: 0.55, from: 3, to: 7 },
  );
});

test("roadHrefFor lets a written world's sentence speak for it: found and v ride, no identity key beside them (#434 ruling C)", () => {
  const href = roadHrefFor({ ...ROAD_WORLD, written: { sentence: "A cold isle of two towns", version: 1 } }, 42, 3, 7);
  const p = new URLSearchParams(href.slice(9));
  assert.deepEqual([...p.keys()], ["found", "v", "style", "table", "a", "b"]);
  assert.equal(p.get("found"), "A cold isle of two towns");
});
