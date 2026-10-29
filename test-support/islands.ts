import type { Field } from "../src/core/grid.ts";
import { labelLandmasses } from "../src/world/landmass.ts";

export const ISLAND_FRACTION = 20 / 76_800;

export function islandCount(elev: Field, seaLevel: number): number {
  const least = ISLAND_FRACTION * elev.w * elev.h;
  return labelLandmasses(elev, seaLevel).sizes.filter((size) => size >= least).length;
}
