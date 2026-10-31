import type { Box } from "../geometry.ts";
import type { Projection } from "../transform.ts";

export const SHEET_INSET = 4;
export const FURNITURE_PAD = 2;

export function insideSheet(b: Box, proj: Projection): boolean {
  return (
    b.x >= proj.margin + SHEET_INSET &&
    b.x + b.w <= proj.widthPx - proj.margin - SHEET_INSET &&
    b.y >= proj.margin + SHEET_INSET &&
    b.y + b.h <= proj.heightPx - proj.margin - SHEET_INSET
  );
}

export function slideInsideSheet(b: Box, proj: Projection): { readonly dx: number; readonly dy: number } {
  void [b, proj];
  return { dx: 0, dy: 0 };
}

export function clearOfFurniture(b: Box, furniture: ReadonlyArray<Box>): boolean {
  void [b, furniture];
  return true;
}
