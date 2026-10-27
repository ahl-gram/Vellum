import type { Box } from "../geometry.ts";
import type { Projection } from "../transform.ts";

export type RiverGrid = { readonly cells: Uint8Array; readonly w: number; readonly h: number };

export function boxMeetsRiver(_box: Box, _rivers: RiverGrid, _proj: Projection): boolean {
  return false;
}
