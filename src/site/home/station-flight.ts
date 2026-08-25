import { type Box, type Cam, camForCenter } from "./camera.ts";

export const STATION_FLIGHT_SECONDS = 1.5;
export const STATION_SCALE_FACTOR = 2.6;
const NARROW_VIEW_W = 900;
const WIDE_ANCHOR_X = 0.4;
const NARROW_ANCHOR_Y = 0.36;

export type StationAnchor = { readonly nx: number; readonly ny: number };

export function stationFlightView(
  cam: Cam,
  fit: number,
  anchor: StationAnchor,
  view: Box,
  sheet: Box,
  viewportW: number,
): Cam {
  const s = Math.max(cam.s, fit * STATION_SCALE_FACTOR);
  const screen =
    viewportW <= NARROW_VIEW_W
      ? { x: view.w / 2, y: view.h * NARROW_ANCHOR_Y }
      : { x: view.w * WIDE_ANCHOR_X, y: view.h / 2 };
  return camForCenter(anchor.nx, anchor.ny, s, view, sheet, screen);
}
