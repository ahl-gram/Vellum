import { test } from "node:test";
import assert from "node:assert/strict";
import { worldFor } from "../../src/site/explorer/world-cache.ts";

test("a world asked for again at the same seed and overrides is the one the cache holds, not drawn again (Issue #1273, from e2e Z16)", () => {
  const first = worldFor(918273);
  const again = worldFor(918273);
  assert.equal(first.cached, false, "the first ask draws the world");
  assert.equal(again.cached, true, "the repeat ask is served from the cache");
  assert.equal(again.world, first.world, "the repeat ask hands back the very world the first drew");
});

test("a world asked for at another seed, or with another override, is drawn fresh and never served from the entry held (Issue #1273, from e2e Z16)", () => {
  const held = worldFor(918273);
  const overridden = worldFor(918273, { landFraction: 0.4 });
  assert.equal(overridden.cached, false, "another override misses the entry held");
  assert.notEqual(overridden.world, held.world, "another override draws a different world object");
  const elsewhere = worldFor(918274, { landFraction: 0.4 });
  assert.equal(elsewhere.cached, false, "another seed misses the entry held");
  assert.notEqual(elsewhere.world, overridden.world, "another seed draws a different world object");
});
