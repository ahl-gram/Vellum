import { test } from "node:test";
import assert from "node:assert/strict";
import { MAP_WORDS, mapNoun } from "../../src/site/shared/map-words.ts";

test("every map type has its article and its written form (Issue #1162)", () => {
  assert.deepEqual(MAP_WORDS, {
    island: "an island",
    archipelago: "an archipelago",
    continent: "a continent",
    citystate: "a city-state",
  });
});

test("every map type has its noun without the article (Issue #1162)", () => {
  assert.deepEqual((["island", "archipelago", "continent", "citystate"] as const).map(mapNoun), [
    "island",
    "archipelago",
    "continent",
    "city-state",
  ]);
});
