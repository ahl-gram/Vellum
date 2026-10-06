import type { World } from "../world/types.ts";

export type RoadTown = { readonly index: number; readonly name: string; readonly kind: string; readonly lateral: number; readonly dist: number };
export type PlateBeast = { readonly name: string; readonly epithet: string; readonly lateral: number };

export type Surroundings = {
  readonly seaName: string | null;
  readonly riverName: string | null;
  readonly rangeName: string | null;
  readonly roadTowns: ReadonlyArray<RoadTown>;
  readonly roadCount: number;
  readonly beast: PlateBeast | null;
};

export const NO_SURROUNDINGS: Surroundings = { seaName: null, riverName: null, rangeName: null, roadTowns: [], roadCount: 0, beast: null };

export function plateSurroundings(world: World, index: number, year: number): Surroundings {
  if (world.settlements[index] === undefined || year < 0) return NO_SURROUNDINGS;
  return NO_SURROUNDINGS;
}
