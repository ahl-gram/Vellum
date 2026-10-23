import { test } from "node:test";
import assert from "node:assert/strict";
import { seedFromHash } from "../../src/site/explorer/address.ts";
import { NOT_A_SEED } from "../../test-support/hash-grammar-fixtures.ts";

test("only a run of digits is a seed: absent, empty, blank, signed, fractional, hex and exponent keys are none", () => {
  for (const notASeed of NOT_A_SEED) assert.equal(seedFromHash(notASeed), null, JSON.stringify(notASeed));
  assert.equal(seedFromHash(null), null);
  assert.equal(seedFromHash("0"), 0, "seed 0 is a real seed when written");
  assert.equal(seedFromHash("42"), 42);
});
