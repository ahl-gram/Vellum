import { test } from "node:test";
import assert from "node:assert/strict";
import { seedFromHash } from "../../src/site/explorer/address.ts";

test("only a run of digits is a seed: absent, empty, blank, signed, fractional, hex and exponent keys are none", () => {
  for (const notASeed of [" ", "\t", "+", "-0", "0x10", "1e3", "12.0", "42 ", " 42"]) assert.equal(seedFromHash(notASeed), null, JSON.stringify(notASeed));
  assert.equal(seedFromHash(null), null);
  assert.equal(seedFromHash(""), null);
  assert.equal(seedFromHash("1.5"), null);
  assert.equal(seedFromHash("-1"), null);
  assert.equal(seedFromHash("abc"), null);
  assert.equal(seedFromHash("0"), 0, "seed 0 is a real seed when written");
  assert.equal(seedFromHash("42"), 42);
});
