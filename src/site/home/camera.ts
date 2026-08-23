export type Cam = { readonly x: number; readonly y: number; readonly s: number };
export type Box = { readonly w: number; readonly h: number };

export const SHEET: Box = { w: 1500, h: 1157.93 };
export const MAX_SCALE = 7;
export const MIN_FIT_FACTOR = 0.65;
export const CLOSE_IN_FACTOR = 1.55;
const FIT_MARGIN = 0.92;

export function fitScale(view: Box, sheet: Box): number {
  return Math.min(view.w / sheet.w, view.h / sheet.h) * FIT_MARGIN;
}

export function camForCenter(
  fx: number,
  fy: number,
  s: number,
  view: Box,
  sheet: Box,
  screen?: { readonly x: number; readonly y: number },
): Cam {
  const sx = screen === undefined ? view.w / 2 : screen.x;
  const sy = screen === undefined ? view.h / 2 : screen.y;
  return { x: sx - fx * sheet.w * s, y: sy - fy * sheet.h * s, s };
}

export function clampCam(cam: Cam, view: Box, sheet: Box, fit: number): Cam {
  const s = Math.max(fit * MIN_FIT_FACTOR, Math.min(MAX_SCALE, cam.s));
  const cx = cam.x + (sheet.w * s) / 2;
  const cy = cam.y + (sheet.h * s) / 2;
  const x = cam.x + Math.max(0, Math.min(view.w, cx)) - cx;
  const y = cam.y + Math.max(0, Math.min(view.h, cy)) - cy;
  return { x, y, s };
}

export function centerFraction(cam: Cam, view: Box, sheet: Box): { fx: number; fy: number } {
  return {
    fx: (view.w / 2 - cam.x) / (sheet.w * cam.s),
    fy: (view.h / 2 - cam.y) / (sheet.h * cam.s),
  };
}

export function closeIn(s: number, fit: number): boolean {
  return s >= fit * CLOSE_IN_FACTOR;
}
