import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import type { World } from "../src/world/types.ts";

const worlds = new Map<number, World>();

export const worldFor = (seed: number): World => {
  const cached = worlds.get(seed);
  if (cached) return cached;
  const w = generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
};
