import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURE_IDS } from "../../src/society/culture-ids.ts";
import type { MapType } from "../../src/terrain/heightfield.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { CLIMATE_TRADITION, LAND_FACTOR, LEXICON, SMALL_WORDS } from "../../src/world/founding/lexicon.ts";
import {
  BAND_WORDS,
  BETWEEN_WORDS,
  DIRECTION_WORDS,
  ISLAND_WORDS,
  NUMBER_WORDS,
  SCALE_WORDS,
  SHAPE_ARTICLES,
  SHAPE_FORMS,
  SHAPE_TRIGGERS,
} from "../../src/world/founding/lexicon-shapes.ts";
import { foundingWords } from "../../src/world/founding/normalize.ts";

const MAP_TYPES: Record<MapType, true> = { island: true, archipelago: true, continent: true, citystate: true };
const CLI_LAND_RANGE = [0.1, 0.7] as const;

test("the first word list is broad", () => {
  assert.ok(LEXICON.length >= 150, `ruled 150 or more, has ${LEXICON.length}`);
});

test("every phrase is already in the form the cleanup gives, so it can match", () => {
  for (const { phrase } of LEXICON) {
    assert.equal(foundingWords(phrase).join(" "), phrase, phrase);
  }
});

test("no phrase is listed twice", () => {
  const seen = new Set<string>();
  for (const { phrase } of LEXICON) {
    assert.ok(!seen.has(phrase), phrase);
    seen.add(phrase);
  }
});

test("no phrase is or holds a small word, so a small word never steers", () => {
  for (const { phrase } of LEXICON) {
    for (const word of phrase.split(" ")) assert.ok(!SMALL_WORDS.has(word), `${phrase}: ${word}`);
  }
});

test("no phrase steers one subject twice", () => {
  for (const { phrase, steers } of LEXICON) {
    const subjects = steers.map((s) => s.subject);
    assert.equal(new Set(subjects).size, subjects.length, phrase);
  }
});

test("some word reaches every map type, every climate and every tradition", () => {
  const reached = (subject: string): Set<string> =>
    new Set(LEXICON.flatMap((e) => e.steers.filter((s) => s.subject === subject).map((s) => String(s.value))));
  assert.deepEqual([...reached("mapType")].sort(), Object.keys(MAP_TYPES).sort());
  assert.deepEqual([...reached("band")].sort(), Object.keys(CLIMATE_TRADITION).sort());
  assert.deepEqual([...reached("culture")].sort(), [...CULTURE_IDS].sort());
});

test("every phrase written with a possessive 's reads as itself", () => {
  for (const { phrase } of LEXICON) {
    for (const mark of ["'", "\u2019"]) {
      assert.deepEqual(foundingWords(`${phrase}${mark}s`), phrase.split(" "), `${phrase}${mark}s`);
    }
  }
});

test("every land strength on every map type stays inside the land range the CLI accepts", () => {
  for (const mapType of Object.keys(MAP_TYPES) as MapType[]) {
    const own = defaultRecipe(0, { mapType }).landFraction;
    for (const factor of Object.values(LAND_FACTOR)) {
      const share = own * factor;
      assert.ok(share >= CLI_LAND_RANGE[0] && share <= CLI_LAND_RANGE[1], `${mapType} x ${factor} = ${share}`);
    }
  }
});

test("every word of the count and shape tables is already in the form the cleanup gives, and none is a listed phrase", () => {
  const listed = new Set(LEXICON.map((entry) => entry.phrase));
  const counting = [NUMBER_WORDS, SCALE_WORDS, BAND_WORDS, BETWEEN_WORDS].flatMap((table) => [...table.keys()]);
  const words = [
    ...counting,
    ...SHAPE_FORMS.keys(),
    ...SHAPE_TRIGGERS,
    ...SHAPE_ARTICLES,
    ...ISLAND_WORDS,
    ...DIRECTION_WORDS,
  ];
  for (const word of words) assert.equal(foundingWords(word).join(" "), word, word);
  for (const word of counting) assert.ok(!listed.has(word), `${word} is a listed phrase`);
});

test("every island word is a listed phrase that steers the archipelago", () => {
  for (const word of ISLAND_WORDS) {
    const entry = LEXICON.find((e) => e.phrase === word);
    assert.ok(entry !== undefined, `${word} is a listed phrase`);
    assert.ok(
      entry.steers.some((s) => s.subject === "mapType" && s.value === "archipelago"),
      `${word} steers the archipelago`,
    );
  }
});
