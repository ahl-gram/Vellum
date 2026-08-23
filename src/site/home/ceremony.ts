import { type Box, type Cam, camForCenter } from "./camera.ts";

// The clock and framing quote runCeremony in the archived mockup at design/atelier-map, the epic's visual spec (#454).
export const TARGET_FATHOMS = 42;
export const MIN_VEIL_MS = 2400;
export const SOUNDING_TICK_MS = 46;
export const LANDFALL_HOLD_MS = 500;
export const FLIGHT_SECONDS = 2.4;
export const WIDE_FACTOR = 0.78;
export const LANDFALL_LABEL = "Landfall";
export const ARRIVED_KEY = "vellum-landfall-arrived";

const LANDFALL_FX = 0.51;
const LANDFALL_FY = 0.485;
const NARROW_VIEW_W = 900;
const NARROW_SCALE = 1.6;
const WIDE_SCALE = 1.72;

export function nextSounding(done: number, roll: number): number {
  return Math.min(TARGET_FATHOMS, done + Math.ceil(roll * 4));
}

export function soundingLabel(fathoms: number): string {
  return `Sounding · ${fathoms} fathom`;
}

export function wideView(view: Box, sheet: Box, fit: number): Cam {
  return camForCenter(0.5, 0.5, fit * WIDE_FACTOR, view, sheet);
}

export function landfallView(view: Box, sheet: Box, fit: number): Cam {
  const scale = fit * (view.w < NARROW_VIEW_W ? NARROW_SCALE : WIDE_SCALE);
  return camForCenter(LANDFALL_FX, LANDFALL_FY, scale, view, sheet);
}

export function firstArrival(getStorage: () => Storage): boolean {
  try {
    return getStorage().getItem(ARRIVED_KEY) === null;
  } catch {
    return true;
  }
}

export function markArrival(getStorage: () => Storage): void {
  try {
    getStorage().setItem(ARRIVED_KEY, "1");
  } catch {
    // Ratified on #457: a blocked storage simply gets the ceremony each arrival.
  }
}
