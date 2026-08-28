/** Provisional feel constants (#472, judged live): the pause that separates two wheel gestures (momentum events arrive well inside it, deliberate flicks outside it), and how long the clamp swallows a finished flick's leftover momentum before the page takes the wheel with no pause needed (the 2026-08-28 ruling replacing the fresh-gesture-only release). */
export const GESTURE_BREAK_MS = 300;
export const MOMENTUM_ABSORB_MS = 400;

export type WheelValve = (now: number, deltaY: number, scrollY: number, zoom: () => boolean) => boolean;

export function createValve(breakMs: number = GESTURE_BREAK_MS, absorbMs: number = MOMENTUM_ABSORB_MS): WheelValve {
  let owner: "camera" | "page" | null = null;
  let lastMs = -Infinity;
  let clampMs: number | null = null;
  return (now, deltaY, scrollY, zoom) => {
    if (now - lastMs >= breakMs) {
      owner = null;
      clampMs = null;
    }
    lastMs = now;
    if (scrollY > 0 || owner === "page") {
      owner = "page";
      clampMs = null;
      return false;
    }
    if (deltaY > 0 && clampMs !== null && now - clampMs >= absorbMs) {
      owner = "page";
      clampMs = null;
      return false;
    }
    if (zoom()) {
      owner = "camera";
      clampMs = null;
      return true;
    }
    if (deltaY > 0 && owner === "camera") {
      if (clampMs === null) clampMs = now;
      return true;
    }
    if (deltaY > 0) {
      owner = "page";
      return false;
    }
    return false;
  };
}
