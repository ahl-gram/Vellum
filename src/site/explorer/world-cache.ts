// Single-entry base-world cache shared by the render worker and its inline fallback; single entry ON PURPOSE, so a sea-level or coast drag changes the key, misses, and never serves a stale waterline.
import { defaultRecipe, generateWorld } from "../../world/generate.ts";
import type { World, WorldRecipe } from "../../world/types.ts";

type Overrides = Partial<WorldRecipe>;

let entry: { key: string; world: World } | null = null;

// overrides is a small FLAT object, so a sorted-key JSON is a canonical fingerprint; seed is prefixed so two seeds never collide.
function keyOf(seed: number, overrides: Overrides | undefined): string {
  const o = overrides || {};
  return seed + "|" + JSON.stringify(o, Object.keys(o).sort());
}

/** `cached` is true exactly when this call SKIPPED generateWorld: the flag the region-cache e2e asserts instead of a timing measurement. */
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
