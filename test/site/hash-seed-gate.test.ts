import { test } from "node:test";
import assert from "node:assert/strict";
import { seedFromHash } from "../../src/site/explorer/address.ts";

// The gate readHash seeds the Explorer through: a bare visit keeps its seed-of-the-day unless the hash carries a real seed. An empty `seed=` is present and is not a seed (it passed as 0 once: #463, CI R0b).
test("absent, empty, fractional and negative keys are no seed; a uint32 is", () => {
  assert.equal(seedFromHash(null), null);
  assert.equal(seedFromHash(""), null);
  assert.equal(seedFromHash("1.5"), null);
  assert.equal(seedFromHash("-1"), null);
  assert.equal(seedFromHash("abc"), null);
  assert.equal(seedFromHash("0"), 0, "seed 0 is a real seed when written");
  assert.equal(seedFromHash("42"), 42);
});
