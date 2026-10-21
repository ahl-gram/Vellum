import type { TerrainParams } from "../terrain/heightfield.ts";
import type { WorldRecipe } from "./types.ts";

// A recipe field that shapes the heightfield joins this list, and reaches the world sheet, both close-up arms and the detail chain from here alone (Issue #453).
export const TERRAIN_INPUT_KEYS = ["coastWarp"] as const satisfies ReadonlyArray<
  keyof TerrainParams & keyof WorldRecipe
>;

export type TerrainInputKey = (typeof TERRAIN_INPUT_KEYS)[number];

export type TerrainInputs = Pick<TerrainParams, TerrainInputKey>;

export function terrainInputsOf(source: TerrainInputs): TerrainInputs {
  const picked: Partial<Record<TerrainInputKey, unknown>> = {};
  for (const key of TERRAIN_INPUT_KEYS) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked as TerrainInputs;
}
