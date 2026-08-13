import type { ProspectInput } from "./input.ts";
import {
  BASE_GROUND,
  GROUND_SAMPLE_STEP,
  MOUND_MAX_RISE,
  RIDGE_MIN_RISE,
  RIDGE_SCALE,
  RIVER_BANK_DROP,
  VIEW_X0,
  VIEW_X1,
  groundAt,
  type Ground,
  type Pt,
} from "./geometry.ts";

/** 0.28 sits just above the coastal shelf most harbors occupy, so ports stay flat while hill and mountain seats rise. */
export const MOUND_REL_START = 0.28;
export const MOUND_REL_FULL = 0.78;
export const MOUND_MIN_RISE = 8;

export function moundRise(siteRel: number): number {
  const t = Math.min(1, Math.max(0, (siteRel - MOUND_REL_START) / (MOUND_REL_FULL - MOUND_REL_START)));
  const rise = MOUND_MAX_RISE * t;
  return rise < MOUND_MIN_RISE ? 0 : rise;
}

export function buildGround(input: ProspectInput): Ground {
  const base =
    input.onRiver && !input.harbor ? BASE_GROUND - RIVER_BANK_DROP : BASE_GROUND;
  const rise = moundRise(input.siteRel);
  const shape = { base, rise };
  const line: Pt[] = [];
  for (let x = VIEW_X0 + 6; x <= VIEW_X1 - 6; x += GROUND_SAMPLE_STEP) {
    line.push({ x, y: groundAt(shape, x) });
  }
  return { base, rise, line };
}

/** The x step is 462/128, a dyadic fraction, so positions are IEEE-exact. */
export function buildRidge(input: ProspectInput, ground: Ground): ReadonlyArray<Pt> | null {
  const rises = input.backdrop.map((v) => Math.max(0, v - input.siteRel));
  if (Math.max(...rises) < RIDGE_MIN_RISE) return null;
  const x0 = VIEW_X0 + 6;
  const step = (VIEW_X1 - 6 - x0) / (input.backdrop.length - 1);
  const horizon = ground.base + 2;
  return rises.map((rise, i) => ({ x: x0 + i * step, y: horizon - RIDGE_SCALE * rise }));
}
