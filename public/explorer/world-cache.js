// Single-entry base-world cache, shared by the render worker (worker.js) and its
// inline fallback (worker-client.js). generateWorld is the CPU floor of any draw,
// atlas, or regional survey; the Surveyor's Glass (#161/#168) fires a fresh region
// job on every settle over the SAME base world, so memoizing the last resolved
// (seed, overrides) world lets a pan/zoom re-survey without regenerating it.
//
// Single entry on purpose: a new key evicts the old, so a sea-level or coast drag
// (landFraction / coastWarp move into `overrides`, changing the key) correctly
// MISSES and regenerates -- the cache never serves a stale waterline. It stays
// fully deterministic: worldFor(seed, overrides) returns exactly the world
// generateWorld(defaultRecipe(seed, overrides)) would, cache hit or miss, so
// worker/inline byte-parity is unaffected.
import { defaultRecipe, generateWorld } from "./engine/world/generate.js";

let entry = null; // { key, world }

// overrides is a small FLAT object, so a sorted-key JSON is a canonical fingerprint
// (key order can't change the hash). seed is prefixed so two seeds never collide.
function keyOf(seed, overrides) {
  const o = overrides || {};
  return seed + "|" + JSON.stringify(o, Object.keys(o).sort());
}

/**
 * The base world for (seed, overrides), memoized single-entry. Returns
 * { world, cached } where `cached` is true exactly when this call SKIPPED
 * generateWorld (a repeat of the last key). The flag is what the region-cache
 * e2e asserts, so the "skips generateWorld the second time" AC needs no flaky
 * timing measurement.
 */
export function worldFor(seed, overrides) {
  const key = keyOf(seed, overrides);
  if (entry && entry.key === key) {
    return { world: entry.world, cached: true };
  }
  const world = generateWorld(defaultRecipe(seed, overrides));
  entry = { key, world };
  return { world, cached: false };
}
