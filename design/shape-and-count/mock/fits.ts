// Issue #849: the "bigger" fit, this round's own remedy for the soft likeness's spill (not ruled). The outline is drawn
// as large as today's dome core: the share of the sheet inside the falloff-start disc, pi * falloffStart^2 / 4 (the
// dome measures half-sheets on each axis, so that disc is a 4:3 ellipse), capped so the outline's box keeps a margin
// of sea on every side.
import type { MapType } from "../../../src/terrain/heightfield.ts";
import { SHAPES } from "./terrain.ts";
import { INNER_INSET, isInside, outlineField, type Outline } from "./outlines.ts";

export const DOME_CORE_SHARE: Record<MapType, number> = {
  island: (Math.PI * SHAPES.island.falloffStart ** 2) / 4,
  archipelago: (Math.PI * SHAPES.archipelago.falloffStart ** 2) / 4,
  continent: (Math.PI * SHAPES.continent.falloffStart ** 2) / 4,
  citystate: (Math.PI * SHAPES.citystate.falloffStart ** 2) / 4,
};
export const MIN_INSETS = [0.06, 0.08] as const;
export const BIG_MIN_INSET = 0.06;

export function cellShare(o: Outline): number {
  const f = outlineField(o);
  let n = 0;
  for (let y = 0; y < 240; y++) for (let x = 0; x < 320; x++) if (isInside(f, x / 319, y / 239)) n++;
  return n / 76800;
}

export function bigFit(make: (inset?: number) => Outline, mapType: MapType, minInset: number = BIG_MIN_INSET): { outline: Outline; inset: number; share: number } {
  const target = DOME_CORE_SHARE[mapType];
  const atMin = make(minInset);
  const minShare = cellShare(atMin);
  if (minShare <= target) return { outline: { ...atMin, fit: `bigger: capped at inset ${minInset} (covers ${(100 * minShare).toFixed(0)}% of the sheet, short of the dome core's ${(100 * target).toFixed(0)}%)` }, inset: minInset, share: minShare };
  let lo = minInset,
    hi = Math.max(INNER_INSET, 0.3);
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (cellShare(make(mid)) > target) lo = mid;
    else hi = mid;
  }
  const inset = Math.round(hi * 1000) / 1000;
  const o = make(inset);
  const share = cellShare(o);
  return { outline: { ...o, fit: `bigger: inset ${inset}, covering ${(100 * share).toFixed(0)}% of the sheet, the dome core's share for the ${mapType} type` }, inset, share };
}
