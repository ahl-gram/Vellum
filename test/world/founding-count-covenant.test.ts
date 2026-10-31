import { test } from "node:test";
import assert from "node:assert/strict";
import { hashString } from "../../src/core/rng.ts";
import { foundWorld, type FoundingOverrides } from "../../src/world/founding/found.ts";
import { FOUNDING_VERSION, LEXICON } from "../../src/world/founding/lexicon.ts";
import {
  BAND_WORDS,
  BETWEEN_WORDS,
  ISLAND_WORDS,
  NUMBER_WORDS,
  SCALE_WORDS,
} from "../../src/world/founding/lexicon-shapes.ts";

const LOCK =
  "until the written-world link goes public in Issue #393, a change to version 1 re-pins these values; once it is public, version 1 is locked and a change is version 2, with version 1 kept (Alex, 2026-10-09)";

type Row = readonly [
  sentence: string,
  seed: number,
  residual: string,
  overrides: FoundingOverrides,
  steered: ReadonlyArray<string>,
  contested: ReadonlyArray<string>,
];

const COUNT_SHEET: ReadonlyArray<Row> = [
  [
    "exactly 100 equal sized round islands",
    1524000883,
    "exactly",
    { mapType: "archipelago", islands: 100 },
    ["100 equal sized round islands"],
    [],
  ],
  ["1,000 islands", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["1 000 islands"], []],
  [
    "100 islands on a vast continent",
    900114535,
    "100 islands on continent",
    { landFraction: 0.336 },
    ["vast"],
    ["100 islands", "continent"],
  ],
  ["five continents", 2931049365, "five", { mapType: "continent" }, ["continents"], []],
  ["three isles", 2166136261, "", { mapType: "archipelago", islands: 3 }, ["three isles"], []],
  ["a thousand small isles", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["thousand small isles"], []],
  [
    "a vast archipelago of 100 islands",
    833488191,
    "vast",
    { mapType: "archipelago", islands: 100 },
    ["archipelago", "100 islands"],
    ["vast"],
  ],
  [
    "twenty five atolls",
    2166136261,
    "",
    { mapType: "archipelago", band: "tropical", culture: "oromi", islands: 25 },
    ["twenty five atolls"],
    [],
  ],
  ["a few islands", 2166136261, "", { mapType: "archipelago", islands: 5 }, ["few islands"], []],
  ["countless islands", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["countless islands"], []],
  ["a dozen islets", 2166136261, "", { mapType: "archipelago", islands: 12 }, ["dozen islets"], []],
  ["scattered isles", 1666792920, "scattered", { mapType: "archipelago" }, ["isles"], []],
  ["one island", 3123124719, "one", { mapType: "island" }, ["island"], []],
  ["000 islands", 3855301319, "000", { mapType: "archipelago" }, ["islands"], []],
  ["007 skerries", 2166136261, "", { mapType: "archipelago", culture: "norden", islands: 7 }, ["007 skerries"], []],
  ["12,345 islands", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["12 345 islands"], []],
  [
    "100 varied islands",
    2166136261,
    "",
    { mapType: "archipelago", islands: 100, isleSize: "varied" },
    ["100 varied islands"],
    [],
  ],
  [
    "a hundred jagged isles",
    2166136261,
    "",
    { mapType: "archipelago", islands: 100, raggedness: 0.95 },
    ["hundred jagged isles"],
    [],
  ],
  ["a hundred smooth isles", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["hundred smooth isles"], []],
  ["seven islands and a free city", 168068561, "seven islands free city", {}, [], ["seven islands", "free city"]],
  [
    "a hundred and fifty coral islands",
    2166136261,
    "",
    { mapType: "archipelago", band: "tropical", culture: "oromi", islands: 100 },
    ["hundred and fifty coral islands"],
    [],
  ],
  ["two hundred islands", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["two hundred islands"], []],
  [
    "100 tropical islands",
    1731450012,
    "100",
    { mapType: "archipelago", band: "tropical", culture: "oromi" },
    ["tropical", "islands"],
    [],
  ],
  [
    "a vast land of 100 islands",
    4276328868,
    "vast land",
    { mapType: "archipelago", islands: 100 },
    ["100 islands"],
    ["vast"],
  ],
  [
    "a few warm atolls",
    2166136261,
    "",
    { mapType: "archipelago", band: "tropical", culture: "oromi", islands: 5 },
    ["few", "warm", "atolls"],
    [],
  ],
  ["constructor islands", 4066221903, "constructor", { mapType: "archipelago" }, ["islands"], []],
  ["the islands few", 2166136261, "", { mapType: "archipelago", islands: 5 }, ["islands", "few"], []],
  [
    "a few rival kingdoms among the isles",
    201153723,
    "rival kingdoms among",
    { mapType: "archipelago", islands: 5 },
    ["few", "isles"],
    [],
  ],
  ["a few kingdoms", 1176359413, "few kingdoms", {}, [], ["few"]],
  [
    "100 islands and a few atolls",
    2166136261,
    "",
    { mapType: "archipelago", band: "tropical", culture: "oromi" },
    ["100 islands", "few atolls"],
    [],
  ],
  ["isles countless", 2166136261, "", { mapType: "archipelago", islands: 100 }, ["isles", "countless"], []],
];

for (const [sentence, seed, residual, overrides, steered, contested] of COUNT_SHEET) {
  test(`the covenant: "${sentence}" founds the count and sizes version 1 founds`, () => {
    const f = foundWorld(sentence);
    assert.ok(f.ok, sentence);
    assert.deepEqual(f.overrides, overrides, LOCK);
    assert.deepEqual(
      f.steered.map((r) => r.phrase),
      steered,
      LOCK,
    );
    assert.deepEqual(
      f.contested.map((r) => r.phrase),
      contested,
      LOCK,
    );
    assert.equal(f.residual, residual);
    assert.equal(hashString(residual), seed, "the pinned seed is the hand-derived residual's own hash");
    assert.equal(f.seed, seed, LOCK);
    assert.equal(f.version, FOUNDING_VERSION);
  });
}

const STEERED: ReadonlyArray<readonly [string, unknown]> = [
  [
    "twenty five atolls",
    [
      {
        phrase: "twenty five atolls",
        steers: [
          { subject: "islands", value: 25 },
          { subject: "mapType", value: "archipelago" },
          { subject: "band", value: "tropical" },
          { subject: "culture", value: "oromi" },
        ],
      },
    ],
  ],
  [
    "100 varied islands",
    [
      {
        phrase: "100 varied islands",
        steers: [
          { subject: "islands", value: 100 },
          { subject: "isleSize", value: "varied" },
          { subject: "mapType", value: "archipelago" },
        ],
      },
    ],
  ],
  [
    "exactly 100 equal sized round islands",
    [
      {
        phrase: "100 equal sized round islands",
        steers: [
          { subject: "islands", value: 100 },
          { subject: "isleSize", value: "equal" },
          { subject: "mapType", value: "archipelago" },
        ],
      },
    ],
  ],
  [
    "a hundred jagged isles",
    [
      {
        phrase: "hundred jagged isles",
        steers: [
          { subject: "islands", value: 100 },
          { subject: "coast", value: "ragged" },
          { subject: "mapType", value: "archipelago" },
        ],
      },
    ],
  ],
  [
    "the islands few",
    [
      { phrase: "islands", steers: [{ subject: "mapType", value: "archipelago" }] },
      { phrase: "few", steers: [{ subject: "islands", value: 5 }] },
    ],
  ],
];

test("a count phrase steers its count, its sizes, its coast and its island word's own meanings, and a band word alone steers its count", () => {
  for (const [sentence, steered] of STEERED) {
    const f = foundWorld(sentence);
    assert.ok(f.ok, sentence);
    assert.deepEqual(f.steered, steered, sentence);
  }
});

const NUMBER_PAIRS: ReadonlyArray<readonly [string, number]> = [
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
];
const TENS = NUMBER_PAIRS.filter(([, value]) => value >= 20);
const UNITS = NUMBER_PAIRS.filter(([, value]) => value < 10);

const countOf = (sentence: string): number | undefined => {
  const f = foundWorld(sentence);
  assert.ok(f.ok, sentence);
  return f.overrides.islands;
};

test("every number form before an island word founds its count, and one below two founds none", () => {
  for (let n = 0; n <= 150; n++) {
    const expected = n < 2 ? undefined : Math.min(n, 100);
    assert.equal(countOf(`${n} islands`), expected, `${n} islands: expected ${expected}`);
  }
  assert.equal(NUMBER_PAIRS.length, 26);
  for (const [word, value] of NUMBER_PAIRS)
    assert.equal(countOf(`${word} islands`), value, `${word} islands: expected ${value}`);
  for (const [tens, ten] of TENS) {
    for (const [unit, one] of UNITS) {
      assert.equal(countOf(`${tens} ${unit} islands`), ten + one, `${tens} ${unit} islands: expected ${ten + one}`);
    }
  }
  const OTHERS: ReadonlyArray<readonly [string, number | undefined]> = [
    ["one islands", undefined],
    ["a dozen islands", 12],
    ["two dozen islands", 24],
    ["a hundred islands", 100],
    ["one hundred islands", 100],
    ["a hundred and fifty islands", 100],
    ["a thousand islands", 100],
    ["a few islands", 5],
    ["countless islands", 100],
    ["hundreds of islands", undefined],
  ];
  for (const [sentence, expected] of OTHERS)
    assert.equal(countOf(sentence), expected, `${sentence}: expected ${expected}`);
});

const BETWEEN: ReadonlyArray<readonly [string, string | null]> = [
  ["equal", "equal"],
  ["equal sized", "equal"],
  ["evenly sized", "equal"],
  ["same sized", "equal"],
  ["varied", "varied"],
  ["different sized", "varied"],
  ["unequal", "varied"],
  ["small", null],
  ["little", null],
  ["tiny", null],
  ["round", null],
];

test("every word that may stand between a number and an island word founds what it says, and the table holds no other", () => {
  assert.deepEqual(
    [...BETWEEN_WORDS.keys()],
    BETWEEN.map(([word]) => word),
  );
  for (const [word, size] of BETWEEN) {
    const sentence = `100 ${word} islands`;
    const f = foundWorld(sentence);
    assert.ok(f.ok, sentence);
    assert.deepEqual(
      f.overrides,
      { mapType: "archipelago", islands: 100, ...(size === "varied" ? { isleSize: "varied" } : {}) },
      word,
    );
    assert.deepEqual(
      f.steered.map((r) => r.phrase),
      [sentence],
      word,
    );
  }
});

const NINE: ReadonlyArray<string> = [
  "islands",
  "isles",
  "islets",
  "atolls",
  "cays",
  "skerries",
  "coral islands",
  "coral isles",
  "spice islands",
];

test("every island word ends a count and brings its own meanings, and the table holds no other", () => {
  assert.deepEqual(ISLAND_WORDS, NINE);
  for (const word of NINE) {
    const entry = LEXICON.find((e) => e.phrase === word);
    assert.ok(entry !== undefined, `${word} is a listed phrase`);
    const f = foundWorld(`100 ${word}`);
    assert.ok(f.ok, word);
    assert.deepEqual(
      f.steered,
      [{ phrase: `100 ${word}`, steers: [{ subject: "islands", value: 100 }, ...entry.steers] }],
      word,
    );
    assert.equal(f.overrides.islands, 100, word);
  }
});

test("the number and band tables hold exactly the words the rule reads", () => {
  assert.deepEqual([...NUMBER_WORDS], [["one", 1], ...NUMBER_PAIRS]);
  assert.deepEqual(
    [...SCALE_WORDS],
    [
      ["dozen", 12],
      ["hundred", 100],
      ["thousand", 1000],
    ],
  );
  assert.deepEqual(
    [...BAND_WORDS],
    [
      ["few", 5],
      ["countless", 100],
    ],
  );
});
