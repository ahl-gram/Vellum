import { test } from "node:test";
import assert from "node:assert/strict";
import { MAP_WORDS } from "../../src/site/shared/map-words.ts";

test("every map type has its article and its written form (Issue #1162)", () => {
  assert.deepEqual(MAP_WORDS, {
    island: "an island",
    archipelago: "an archipelago",
    continent: "a continent",
    citystate: "a city-state",
  });
});
