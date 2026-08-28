/** Provisional feel constant (#472, judged rendered): the pause that separates two wheel gestures; momentum events arrive well inside it, deliberate flicks outside it. */
export const GESTURE_BREAK_MS = 300;

export type WheelValve = (now: number, deltaY: number, scrollY: number, zoom: () => boolean) => boolean;

export function createValve(breakMs: number = GESTURE_BREAK_MS): WheelValve {
  let owner: "camera" | "page" | null = null;
  let lastMs = -Infinity;
  return (now, deltaY, scrollY, zoom) => {
    if (now - lastMs >= breakMs) owner = null;
    lastMs = now;
    if (scrollY > 0 || owner === "page") {
      owner = "page";
      return false;
    }
    if (zoom()) {
      owner = "camera";
      return true;
    }
    if (deltaY > 0) {
      if (owner === "camera") return true;
      owner = "page";
      return false;
    }
    return false;
  };
}
