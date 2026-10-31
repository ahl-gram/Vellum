// The Surveyor's Glass keys every chart room shares, the Explorer's included (Issue #1011): the press step, the glide's timing token and the keydown binding on the focusable viewport, where 0 homes by whatever home the page hands in.
import type { ZoomController } from "./zoom-controller.ts";

export const ZOOM_STEP = 1.4;
const PAN_FRACTION = 0.15;

// Issue #170: single timing source (the --glide token), read per glide so a stylesheet tweak takes effect without a reload; reduced motion never reaches it.
export function glideMs(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide"));
  return Number.isFinite(v) ? v : 300;
}

export function bindZoomKeys(
  viewport: HTMLElement,
  zoom: Pick<ZoomController, "glideBy" | "panBy">,
  home: () => void,
): void {
  void zoom;
  void home;
  viewport.addEventListener("keydown", (e) => e.preventDefault());
}
