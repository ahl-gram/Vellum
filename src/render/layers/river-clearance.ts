import type { Box } from "../geometry.ts";
import type { Projection } from "../transform.ts";

export type RiverGrid = { readonly cells: Uint8Array; readonly w: number; readonly h: number };

export function boxMeetsRiver(box: Box, rivers: RiverGrid, proj: Projection): boolean {
  const toGrid = (p: number): number => (p - proj.margin) / proj.scale;
  const gx0 = Math.max(0, Math.ceil(toGrid(box.x) - 0.5));
  const gx1 = Math.min(rivers.w - 1, Math.floor(toGrid(box.x + box.w) + 0.5));
  const gy0 = Math.max(0, Math.ceil(toGrid(box.y) - 0.5));
  const gy1 = Math.min(rivers.h - 1, Math.floor(toGrid(box.y + box.h) + 0.5));
  for (let gy = gy0; gy <= gy1; gy++) {
    for (let gx = gx0; gx <= gx1; gx++) {
      if (rivers.cells[gx + gy * rivers.w] === 1) return true;
    }
  }
  return false;
}
