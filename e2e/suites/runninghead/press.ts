export type Box = { readonly l: number; readonly t: number; readonly r: number; readonly b: number };
export type Target = { readonly name: string; readonly box: Box };
export type PressRead = { readonly fonts: string; readonly press: Box | null; readonly others: readonly Target[] };

// 2026-11-23: ruled, a thumb's 24px (handbook/specs/ui-design.md, the paragraph opening "The head cluster says where the reader is standing").
export const THUMB = 24;

const centreOf = (b: Box): readonly [number, number] => [(b.l + b.r) / 2, (b.t + b.b) / 2];
const undersized = (b: Box): boolean => b.r - b.l < THUMB || b.b - b.t < THUMB;
const reach = (x: number, y: number, b: Box): number =>
  Math.hypot(Math.max(0, b.l - x, x - b.r), Math.max(0, b.t - y, y - b.b));

export function spacingOf(press: Box, other: Box): { centre: number; full: number } {
  const [px, py] = centreOf(press);
  const [ox, oy] = centreOf(other);
  const centre = Math.hypot(px - ox, py - oy);
  const parts: number[] = [];
  if (undersized(press)) parts.push(reach(px, py, other) - THUMB / 2);
  if (undersized(other)) parts.push(reach(ox, oy, press) - THUMB / 2);
  if (undersized(press) && undersized(other)) parts.push(centre - THUMB);
  return { centre, full: parts.length === 0 ? Infinity : Math.min(...parts) };
}

export function pressSpacingFaults(_route: string, _read: PressRead | undefined): string[] {
  return [];
}
