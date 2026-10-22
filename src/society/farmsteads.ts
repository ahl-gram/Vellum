import type { Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { NamedSettlement, World } from "../world/types.ts";

export const FARMSTEAD_LATTICE_WORLD_CELLS = 1;
export const FARMSTEAD_DENSITY = 0.11;
export const FARMSTEAD_SPACING_WORLD_CELLS = 0.45;
export const MILL_REACH_WORLD_CELLS = 0.18;
export const FARMSTEAD_MAX_WINDOW_UV = 1 / 32;

export type FarmsteadCandidate = {
  readonly u: number;
  readonly v: number;
  readonly name: string;
  readonly score: number;
  readonly founded: number;
};

export function farmsteadCandidates(_world: World, _window: UvWindow): FarmsteadCandidate[] {
  return [];
}

export function placeFarmsteads(
  _world: World,
  _window: UvWindow,
  _ground: { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array },
): NamedSettlement[] {
  return [];
}
