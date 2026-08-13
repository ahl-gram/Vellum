import { clamp } from "../core/math.ts";
import type { UvWindow } from "../terrain/heightfield.ts";

/** One rung of the Surveyor's Glass zoom schedule. The grid is FIXED per band, so every device draws byte-identical cells for a given band + window. */
export type LodBand = {
  readonly index: number;
  readonly k: number;
  readonly sizeUV: number;
  readonly gridW: number;
  readonly gridH: number;
  readonly isRegion: boolean;
};

export const LOD_BANDS: readonly LodBand[] = [
  { index: 0, k: 1, sizeUV: 1, gridW: 320, gridH: 240, isRegion: false },
  { index: 1, k: 2, sizeUV: 0.5, gridW: 320, gridH: 240, isRegion: true },
  { index: 2, k: 4, sizeUV: 0.25, gridW: 320, gridH: 240, isRegion: true },
  { index: 3, k: 8, sizeUV: 0.125, gridW: 320, gridH: 240, isRegion: true },
];

const LAST_BAND = LOD_BANDS.length - 1;

const BOUNDARIES: readonly number[] = LOD_BANDS.slice(0, LAST_BAND).map((b, i) =>
  Math.sqrt(b.k * (LOD_BANDS[i + 1] as LodBand).k),
);

const HYSTERESIS = 0.12;
const UP = BOUNDARIES.map((b) => b * (1 + HYSTERESIS));
const DOWN = BOUNDARIES.map((b) => b / (1 + HYSTERESIS));

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

export const LATTICE_DIVISIONS = 8;

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

/** size is a REGION band size sharing windowAround's unstated precondition size <= 0.98; above it 0.99 - size < 0.01 inverts the clamp. Band 0 never comes here. */
export function lodWindowFor(cx: number, cy: number, size: number): UvWindow {
  const half = size / 2;
  const u0 = clamp(cx - half, 0.01, 0.99 - size);
  const v0 = clamp(cy - half, 0.01, 0.99 - size);
  return { u0, v0, u1: u0 + size, v1: v0 + size };
}

/** A camera: centre fraction + continuous zoom. Sheet-fraction or plot-uv per context. */
export type UvCamera = { readonly cx: number; readonly cy: number; readonly k: number };

export const FULL_WINDOW: UvWindow = { u0: 0, v0: 0, u1: 1, v1: 1 };

/** Margin fractions of a rendered sheet: marginPx/widthPx and marginPx/heightPx. */
export type SheetMargins = { readonly mx: number; readonly my: number };

/** A rect in sheet fractions (of the full chart box, margins included). */
export type SheetRect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

export function plotUvFromSheet(cam: UvCamera, m: SheetMargins): UvCamera {
  return {
    cx: clamp((cam.cx - m.mx) / (1 - 2 * m.mx), 0, 1),
    cy: clamp((cam.cy - m.my) / (1 - 2 * m.my), 0, 1),
    k: cam.k,
  };
}

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

/** The camera is world-relative at every band: a committed region only mounts an inset, never rebases. */
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
