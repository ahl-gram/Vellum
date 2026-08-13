import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { CULTURES } from "../../src/society/names.ts";

// The covenant of seed 42 (#235): the culture fork draws u = 0.69486..., so pick() resolves floor(u * 10) = 6; oromi MUST sit at index 6 of the ten-culture roster or seed 42 draws a different culture and the golden re-rolls.
// The pick() assertion is the true invariant (survives a future edition that re-derives the index); the index-6 assertion pins the current normative order.
test("seed 42's culture fork resolves to oromi at index 6 (the covenant)", () => {
  assert.equal(
    CULTURES[6]?.id,
    "oromi",
    "oromi must sit at index 6 of CULTURES (covenant of seed 42 - DO NOT MOVE)",
  );
  const picked = createRng(42).fork("culture").pick(CULTURES);
  assert.equal(
    picked.id,
    "oromi",
    "seed 42 must still draw oromi, or the golden re-rolls its culture and names",
  );
});
