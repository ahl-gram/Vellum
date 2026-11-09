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
