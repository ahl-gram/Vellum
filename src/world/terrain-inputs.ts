import type { TerrainParams } from "../terrain/heightfield.ts";
import type { WorldRecipe } from "./types.ts";

type SharedKey = keyof TerrainParams & keyof WorldRecipe;

type ScalarKey = { [K in SharedKey]-?: NonNullable<TerrainParams[K]> extends number | string ? K : never }[SharedKey];

// A recipe field that shapes the heightfield joins this list, and reaches the world sheet, both close-up arms and the detail chain from here alone (Issue #453); its value is a number or a string, since chainCacheKey joins it into a string.
export const TERRAIN_INPUT_KEYS = [
  "coastWarp",
  "outline",
  "looseness",
  "islands",
  "isleSize",
  "raggedness",
] as const satisfies ReadonlyArray<ScalarKey>;

export type TerrainInputKey = (typeof TERRAIN_INPUT_KEYS)[number];

export type TerrainInputs = Pick<TerrainParams, TerrainInputKey>;

export function terrainInputsOf(source: TerrainInputs): TerrainInputs {
  const picked: Partial<Record<TerrainInputKey, unknown>> = {};
  for (const key of TERRAIN_INPUT_KEYS) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked as TerrainInputs;
}
