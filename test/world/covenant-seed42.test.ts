import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { CULTURES } from "../../src/society/names.ts";

// The culture fork draws u = 0.69486..., so pick() resolves floor(u * 10) = 6; the pick() assertion is the invariant, the index-6 one pins the normative order.
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
