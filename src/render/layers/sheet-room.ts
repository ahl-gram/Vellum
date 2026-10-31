import { boxesOverlap, type Box } from "../geometry.ts";
import type { Projection } from "../transform.ts";

export const SHEET_INSET = 4;
const FURNITURE_PAD = 2;

export function insideSheet(b: Box, proj: Projection): boolean {
  return (
    b.x >= proj.margin + SHEET_INSET &&
    b.x + b.w <= proj.widthPx - proj.margin - SHEET_INSET &&
    b.y >= proj.margin + SHEET_INSET &&
    b.y + b.h <= proj.heightPx - proj.margin - SHEET_INSET
  );
}

export function slideInsideSheet(b: Box, proj: Projection): { readonly dx: number; readonly dy: number } {
  const lo = proj.margin + SHEET_INSET;
  return {
    dx: Math.max(0, lo - b.x) - Math.max(0, b.x + b.w - (proj.widthPx - lo)),
    dy: Math.max(0, lo - b.y) - Math.max(0, b.y + b.h - (proj.heightPx - lo)),
  };
}

export function clearOfFurniture(b: Box, furniture: ReadonlyArray<Box>): boolean {
  return furniture.every((f) => !boxesOverlap(b, f, FURNITURE_PAD));
}
