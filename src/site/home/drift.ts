import type { Cam } from "./camera.ts";

export const IDLE_DELAY_MS = 9000;
export const DRIFT_SECONDS = 14;
export const DRIFT_DX = 14;
export const DRIFT_DY = -10;
export const DRIFT_SCALE = 1.015;

export function driftTarget(cam: Cam): Cam {
  return { x: cam.x + DRIFT_DX, y: cam.y + DRIFT_DY, s: cam.s * DRIFT_SCALE };
}
