import { test } from "node:test";
import assert from "node:assert/strict";
import { hashString } from "../../src/core/rng.ts";
import { committedGazetteer, useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";
import { foundWorld } from "../../src/world/founding/found.ts";
import { FOUNDING_VERSION } from "../../src/world/founding/lexicon.ts";
import { PLACE_PREFERENCES, SHAPE_FORMS, SHAPE_TRIGGERS } from "../../src/world/founding/lexicon-shapes.ts";
import { foundingWords } from "../../src/world/founding/normalize.ts";
import { placeKey } from "../../src/world/founding/shapes.ts";

useCommittedGazetteer();

const LOCK =
  "until the written-world link goes public in Issue #393, a change to version 1 re-pins these values; once it is public, version 1 is locked and a change is version 2, with version 1 kept (Alex, 2026-10-09)";

type Row = readonly [
  sentence: string,
  seed: number,
  residual: string,
  overrides: Readonly<Record<string, unknown>>,
  steered: ReadonlyArray<string>,
  contested: ReadonlyArray<string>,
];

const SHAPE_SHEET: ReadonlyArray<Row> = [
  [
    "100 islands shaped like Texas",
    2166136261,
    "",
    { mapType: "archipelago", outline: "ne-1159315211" },
    ["100 islands", "shaped like texas"],
    [],
  ],
  [
    "an island shaped like texas",
    2166136261,
    "",
    { mapType: "island", outline: "ne-1159315211" },
    ["island", "shaped like texas"],
    [],
  ],
  [
    "tropical island in the shape of Texas",
    2166136261,
    "",
    { mapType: "island", band: "tropical", culture: "oromi", outline: "ne-1159315211" },
    ["tropical", "island", "in the shape of texas"],
    [],
  ],
  ["a land the shape of japan", 1844065948, "land", { outline: "ne-1159320937" }, ["the shape of japan"], []],
  [
    "shaped like the united kingdom",
    2166136261,
    "",
    { outline: "ne-1159320713" },
    ["shaped like the united kingdom"],
    [],
  ],
  ["in the shape of a crescent", 2166136261, "", { outline: "crescent" }, ["in the shape of a crescent"], []],
  ["shaped like a ring", 2166136261, "", { outline: "ring" }, ["shaped like a ring"], []],
  ["shaped like a circle", 2166136261, "", { outline: "round" }, ["shaped like a circle"], []],
  ["shaped like Florida", 2166136261, "", { outline: "ne-1159315207" }, ["shaped like florida"], []],
  ["shaped like Georgia", 2166136261, "", { outline: "ne-1159311857" }, ["shaped like georgia"], []],
  ["shaped like Curacao", 2166136261, "", { outline: "ne-1159321099" }, ["shaped like curacao"], []],
  [
    "a vast island shaped like texas",
    833488191,
    "vast",
    { mapType: "island", outline: "ne-1159315211" },
    ["island", "shaped like texas"],
    ["vast"],
  ],
  [
    "a ragged island shaped like texas",
    3707108931,
    "ragged",
    { mapType: "island", outline: "ne-1159315211" },
    ["island", "shaped like texas"],
    ["ragged"],
  ],
  ["shaped like atlantis", 686541379, "shaped like atlantis", {}, [], []],
  ["a texas island", 1052843674, "texas", { mapType: "island" }, ["island"], []],
  ["shaped like A Coruna", 2166136261, "", { outline: "ne-1159310639" }, ["shaped like a coruna"], []],
  ["shaped like constructor", 3544313065, "shaped like constructor", {}, [], []],
  [
    "a crescent of warm islands",
    2166136261,
    "",
    { mapType: "archipelago", band: "tropical", culture: "oromi", outline: "crescent" },
    ["crescent", "warm", "islands"],
    [],
  ],
  ["a round island", 2166136261, "", { mapType: "island", outline: "round" }, ["round island"], []],
  [
    "a crescent shaped island",
    2166136261,
    "",
    { mapType: "island", outline: "crescent" },
    ["crescent shaped", "island"],
    [],
  ],
];

for (const [sentence, seed, residual, overrides, steered, contested] of SHAPE_SHEET) {
  test(`the covenant: "${sentence}" founds the shape version 1 founds`, () => {
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

const steeredOf = (sentence: string) => {
  const f = foundWorld(sentence);
  assert.ok(f.ok, sentence);
  return f.steered;
};

test("a shape phrase steers its outline and nothing else", () => {
  assert.deepEqual(steeredOf("100 islands shaped like Texas"), [
    { phrase: "100 islands", steers: [{ subject: "mapType", value: "archipelago" }] },
    { phrase: "shaped like texas", steers: [{ subject: "outline", value: "ne-1159315211" }] },
  ]);
  assert.deepEqual(steeredOf("in the shape of a crescent"), [
    { phrase: "in the shape of a crescent", steers: [{ subject: "outline", value: "crescent" }] },
  ]);
});

const THREE: ReadonlyArray<string> = ["in the shape of", "the shape of", "shaped like"];
const FORM_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["crescent", "crescent"],
  ["ring", "ring"],
  ["circle", "round"],
];

test("every trigger before every form, with and without an article, draws that form, and the tables hold no other", () => {
  assert.deepEqual(SHAPE_TRIGGERS, THREE);
  assert.deepEqual([...SHAPE_FORMS], FORM_PAIRS);
  for (const trigger of THREE) {
    for (const [name, form] of FORM_PAIRS) {
      for (const prefix of ["", "a "]) {
        const sentence = `${trigger} ${prefix}${name}`;
        const f = foundWorld(sentence);
        assert.ok(f.ok, sentence);
        assert.deepEqual(f.overrides, { outline: form }, sentence);
      }
    }
  }
});

test("every place name, after a shape phrase, founds what version 1 founds", () => {
  const rows = committedGazetteer();
  const founds = rows.map(([, name]) => foundWorld(`shaped like ${name}`));
  assert.equal(hashString(JSON.stringify(founds)), 2072831757, LOCK);
  const shapeless = rows.filter((_, i) => !(founds[i]?.ok === true && founds[i].overrides.outline !== undefined));
  assert.deepEqual(shapeless, [], "every one of the place names founds some outline");
});

test("every preferred place is a place of that name that shares it with another", () => {
  const rows = committedGazetteer();
  const keyOf = (name: string): string => placeKey(foundingWords(name));
  for (const [key, id] of PLACE_PREFERENCES) {
    const named = rows.filter(([, name]) => keyOf(name) === key);
    assert.ok(
      named.some(([rowId]) => rowId === id),
      `${key}: ${id} is a place of that name`,
    );
    assert.ok(named.length > 1, `${key}: another place shares the name`);
  }
});
