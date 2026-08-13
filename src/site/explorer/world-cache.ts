// Single-entry base-world cache, shared by the render worker and its inline fallback:
// the Glass fires a fresh region job on every settle over the SAME base world, so
// memoizing the last (seed, overrides) world lets a pan/zoom re-survey without
// regenerating. Single entry ON PURPOSE: a sea-level or coast drag changes the key,
// correctly MISSES, and the cache never serves a stale waterline. Fully deterministic:
// hit or miss, worldFor returns exactly what generateWorld(defaultRecipe(...)) would,
// so worker/inline byte-parity is unaffected.
import { defaultRecipe, generateWorld } from "../../world/generate.ts";
import type { World, WorldRecipe } from "../../world/types.ts";

type Overrides = Partial<WorldRecipe>;

let entry: { key: string; world: World } | null = null;

// overrides is a small FLAT object, so a sorted-key JSON is a canonical fingerprint; seed is prefixed so two seeds never collide.
function keyOf(seed: number, overrides: Overrides | undefined): string {
  const o = overrides || {};
  return seed + "|" + JSON.stringify(o, Object.keys(o).sort());
}

/** The base world for (seed, overrides), memoized single-entry; `cached` is true exactly when this call SKIPPED generateWorld, which is the flag the region-cache e2e asserts instead of a flaky timing measurement. */
export function worldFor(
  seed: number,
  overrides?: Overrides,
): { world: World; cached: boolean } {
  const key = keyOf(seed, overrides);
  if (entry && entry.key === key) {
    return { world: entry.world, cached: true };
  }
  const world = generateWorld(defaultRecipe(seed, overrides));
  entry = { key, world };
  return { world, cached: false };
}
