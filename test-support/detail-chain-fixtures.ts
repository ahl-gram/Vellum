import type { UvWindow } from "../src/terrain/heightfield.ts";
import { defaultRecipe } from "../src/world/generate.ts";

export const SEED = 42;
export const recipe = defaultRecipe(SEED);
export const WORLD_ASPECT = 319 / 239;

export function windowsEqual(a: UvWindow, b: UvWindow): boolean {
  return a.u0 === b.u0 && a.v0 === b.v0 && a.u1 === b.u1 && a.v1 === b.v1;
}
