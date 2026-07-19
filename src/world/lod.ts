import { clamp } from "../core/math.ts";
import type { UvWindow } from "../terrain/heightfield.ts";

/**
 * One rung of the Surveyor's Glass zoom schedule (#161/#168). Band 0 is the
 * whole-world sheet; bands 1..3 are progressively finer regional surveys of the
 * SAME world. `sizeUV` is the fraction of the world (in each axis) the window
 * spans, and it is exactly `1/k`. The grid is FIXED per band at the atlas-proven
 * 320x240, so a smaller window at the same grid is literally a finer survey, and
 * every device draws byte-identical cells for a given band + window.
 */
export type LodBand = {
  readonly index: number;
  readonly k: number;
  readonly sizeUV: number;
  readonly gridW: number;
  readonly gridH: number;
  /** Band 0 is the flat world chart (no window); 1..3 are region jobs. */
  readonly isRegion: boolean;
};

export const LOD_BANDS: readonly LodBand[] = [
  { index: 0, k: 1, sizeUV: 1, gridW: 320, gridH: 240, isRegion: false },
  { index: 1, k: 2, sizeUV: 0.5, gridW: 320, gridH: 240, isRegion: true },
  { index: 2, k: 4, sizeUV: 0.25, gridW: 320, gridH: 240, isRegion: true },
  { index: 3, k: 8, sizeUV: 0.125, gridW: 320, gridH: 240, isRegion: true },
];

const LAST_BAND = LOD_BANDS.length - 1;

// Band boundaries at the geometric mean of adjacent k rungs, so the crossover
// sits symmetrically in log space (sqrt(1*2), sqrt(2*4), sqrt(4*8)).
const BOUNDARIES: readonly number[] = LOD_BANDS.slice(0, LAST_BAND).map((b, i) =>
  Math.sqrt(b.k * (LOD_BANDS[i + 1] as LodBand).k),
);

// Hysteresis deadband: to climb past boundary i you must reach k >= boundary*(1+H);
// to drop below it k must fall under boundary/(1+H). Between the two you keep the
// band you already hold, so a settle jittering near a boundary never thrashes.
const HYSTERESIS = 0.12;
const UP = BOUNDARIES.map((b) => b * (1 + HYSTERESIS));
const DOWN = BOUNDARIES.map((b) => b / (1 + HYSTERESIS));

/**
 * The band a camera zoom `k` should draw. With no `currentBand` it returns the
 * nominal band (the rung whose boundaries `k` has crossed). Given a current band
 * it applies hysteresis: it climbs while `k` is past the next up-threshold and
 * drops while `k` is under the current down-threshold, so a multi-band jump still
 * resolves fully (the loops run as far as needed) but a jitter in a deadband holds.
 */
export function bandFor(k: number, currentBand?: number): number {
  if (currentBand === undefined) {
    let band = 0;
    while (band < LAST_BAND && k >= (BOUNDARIES[band] as number)) band++;
    return band;
  }
  let band = clamp(Math.round(currentBand), 0, LAST_BAND);
  while (band < LAST_BAND && k >= (UP[band] as number)) band++;
  while (band > 0 && k < (DOWN[band - 1] as number)) band--;
  return band;
}

/** Lattice cells per window size: quantizeCenter snaps a centre to this grid. */
export const LATTICE_DIVISIONS = 8;

/**
 * Snap a uv camera centre to a fixed lattice sized to the window, so two nearby
 * settles resolve to the SAME window: the worker's world cache stays warm and the
 * stamped region recipe (hence a shared link) is stable under sub-cell jitter.
 * The lattice is absolute (multiples of the step from the origin), not relative to
 * the current centre, so snapping is idempotent.
 */
export function quantizeCenter(
  cx: number,
  cy: number,
  sizeUV: number,
): { readonly cx: number; readonly cy: number } {
  const step = sizeUV / LATTICE_DIVISIONS;
  return {
    cx: Math.round(cx / step) * step,
    cy: Math.round(cy / step) * step,
  };
}

/**
 * The uv window of the given size centred on (cx, cy), clamped to keep the whole
 * window on the sheet. The clamp bounds `[0.01, 0.99 - size]` mirror windowAround
 * (region.ts) exactly; the lod.test.ts clamp-parity check pins the two together so
 * they cannot drift.
 *
 * `size` is a REGION band size (bands 1..3: 0.5 / 0.25 / 0.125), like windowAround's;
 * both share the unstated precondition size <= 0.98 (above it, 0.99-size < 0.01 inverts
 * the clamp). Band 0 (sizeUV 1) is the flat world sheet -- isRegion:false -- and is
 * never fed here; the world chart takes no window.
 */
export function lodWindowFor(cx: number, cy: number, size: number): UvWindow {
  const half = size / 2;
  const u0 = clamp(cx - half, 0.01, 0.99 - size);
  const v0 = clamp(cy - half, 0.01, 0.99 - size);
  return { u0, v0, u1: u0 + size, v1: v0 + size };
}
