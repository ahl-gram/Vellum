import { type Box, type Cam, camForCenter } from "./camera.ts";

export const STATION_FLIGHT_SECONDS = 1.5;
export const STATION_SCALE_FACTOR = 2.6;
const ANCHOR_X = 0.4;

export type StationAnchor = { readonly nx: number; readonly ny: number };

export function stationFlightView(cam: Cam, fit: number, anchor: StationAnchor, view: Box, sheet: Box): Cam {
  const s = Math.max(cam.s, fit * STATION_SCALE_FACTOR);
  return camForCenter(anchor.nx, anchor.ny, s, view, sheet, { x: view.w * ANCHOR_X, y: view.h / 2 });
}

export function revealLeft(scrollX: number, clientWidth: number, left: number, right: number, margin: number): number {
  const showsRight = Math.max(scrollX, right + margin - clientWidth);
  return Math.max(0, Math.min(showsRight, left - margin));
}
