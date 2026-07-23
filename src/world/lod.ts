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

// ---- Sub 8 settle + inset math (#169) --------------------------------------------
// The redraft state machine's PURE core, kept here (not in the public/ controller) so it
// unit-tests from source with no build artifact. The DOM orchestration (inset mount,
// crossfade, worker dispatch, overlay) lives in public/explorer/lod-controller.js and is
// proven by e2e; this file owns the "given the world camera, what should the next sheet
// be" decision and the geometry that mounts a region sheet INSIDE the world sheet.
//
// Redesigned in PR #245 review: the camera stays world-relative for good (no rebase),
// so the sole coordinate conversion left is sheet fraction <-> plot-uv (the frame
// margin), plus the inset placement rects.

/** A camera: centre fraction + continuous zoom. Sheet-fraction or plot-uv per context. */
export type UvCamera = { readonly cx: number; readonly cy: number; readonly k: number };

/** The whole-world window (band 0): the full sheet. */
export const FULL_WINDOW: UvWindow = { u0: 0, v0: 0, u1: 1, v1: 1 };

/** Margin fractions of a rendered sheet: marginPx/widthPx and marginPx/heightPx. */
export type SheetMargins = { readonly mx: number; readonly my: number };

/** A rect in sheet fractions (of the full chart box, margins included). */
export type SheetRect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

/**
 * Convert the camera read against the SHEET (fractions of the full chart box, the
 * space cameraFromTransform works in) into plot-uv (fractions of the world grid, the
 * space region windows live in). The chart draws its grid inset by a frame margin on
 * every side, so the two differ by that margin; clamped because a camera centred over
 * the margin/frame area is still best served by the nearest edge of the plot.
 */
export function plotUvFromSheet(cam: UvCamera, m: SheetMargins): UvCamera {
  return {
    cx: clamp((cam.cx - m.mx) / (1 - 2 * m.mx), 0, 1),
    cy: clamp((cam.cy - m.my) / (1 - 2 * m.my), 0, 1),
    k: cam.k,
  };
}

/** The sheet-fraction rect a plot-uv window occupies on the world sheet (used to aim
 *  the drafting indicator, and as the alignment target for insetSheetRect). */
export function windowSheetRect(window: UvWindow, m: SheetMargins): SheetRect {
  const sx = 1 - 2 * m.mx;
  const sy = 1 - 2 * m.my;
  return {
    x: m.mx + window.u0 * sx,
    y: m.my + window.v0 * sy,
    w: (window.u1 - window.u0) * sx,
    h: (window.v1 - window.v0) * sy,
  };
}

/**
 * Where a region sheet mounts inside the world sheet's box (both as fractions of that
 * box) so the region's PLOT AREA lands exactly on the window it re-surveys. The region
 * sheet is rendered with the SAME margin fractions at the same aspect, scaled to `s`
 * (the window size), so its own margins overhang the window rect by m*s on each side:
 * the mounted sheet reads as a detail survey pasted over the master chart, its frame
 * just outside the terrain it refines. For a centred window the overhang cancels and
 * the mount is exactly (u0, v0, s, s).
 */
export function insetSheetRect(window: UvWindow, m: SheetMargins): SheetRect {
  const s = window.u1 - window.u0; // LOD windows are square, so one size serves both axes
  const r = windowSheetRect(window, m);
  return { x: r.x - m.mx * s, y: r.y - m.my * s, w: s, h: s };
}

function windowsEqual(a: UvWindow, b: UvWindow): boolean {
  return (
    Math.abs(a.u0 - b.u0) < 1e-9 &&
    Math.abs(a.v0 - b.v0) < 1e-9 &&
    Math.abs(a.u1 - b.u1) < 1e-9 &&
    Math.abs(a.v1 - b.v1) < 1e-9
  );
}

export type SettleDecision =
  | { readonly action: "noop" }
  | { readonly action: "world" }
  | { readonly action: "region"; readonly band: number; readonly window: UvWindow };

/**
 * Decide what a settle should do, given the WORLD `camera` (plot-uv centre + viewport
 * zoom -- the camera is world-relative at every band, since a committed region only
 * mounts an inset and never rebases), the plot-uv `currentWindow` of the committed
 * inset (FULL_WINDOW at band 0), and the `currentBand` held. Resolves the band with
 * hysteresis and quantizes the window:
 *  - band 0 with an inset committed -> drop it and return to the bare world sheet
 *    ("world"); on the bare world sheet itself -> "noop".
 *  - band >= 1 with the SAME band and window already committed -> "noop".
 *  - otherwise -> "region" with the quantized band + window to draw.
 */
export function decideSettle(state: {
  readonly camera: UvCamera;
  readonly currentWindow: UvWindow;
  readonly currentBand: number;
}): SettleDecision {
  const band = bandFor(state.camera.k, state.currentBand);
  if (band === 0) {
    return state.currentBand === 0 ? { action: "noop" } : { action: "world" };
  }
  const size = (LOD_BANDS[band] as LodBand).sizeUV;
  const { cx, cy } = quantizeCenter(state.camera.cx, state.camera.cy, size);
  const window = lodWindowFor(cx, cy, size);
  if (band === state.currentBand && windowsEqual(window, state.currentWindow)) {
    return { action: "noop" }; // same survey already on screen: skip the redraft
  }
  return { action: "region", band, window };
}
