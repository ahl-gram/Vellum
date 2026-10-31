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
  // Scoped to the focusable viewport, not document, so the arrows never hijack page scroll; the pan arrows stay instant on purpose (the accessible pan baseline).
  viewport.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const W = viewport.clientWidth;
    const H = viewport.clientHeight;
    switch (e.key) {
      case "+":
      case "=":
        zoom.glideBy(ZOOM_STEP);
        break;
      case "-":
      case "_":
        zoom.glideBy(1 / ZOOM_STEP);
        break;
      case "ArrowLeft":
        zoom.panBy(W * PAN_FRACTION, 0);
        break;
      case "ArrowRight":
        zoom.panBy(-W * PAN_FRACTION, 0);
        break;
      case "ArrowUp":
        zoom.panBy(0, H * PAN_FRACTION);
        break;
      case "ArrowDown":
        zoom.panBy(0, -H * PAN_FRACTION);
        break;
      case "0":
        home();
        break;
      default:
        return;
    }
    e.preventDefault();
  });
}
