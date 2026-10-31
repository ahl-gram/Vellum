// The Glass's presses on a plain controller, the Hunt's and every room whose camera is purely geometric: every [data-zoom] press on the page and the touch press, beside the shared keys of zoom-keys.ts homing by the plain glide. The Explorer binds its presses by id in glass.ts.
import { bindChartTouch, pageTouchEnv } from "./chart-touch.ts";
import type { ZoomController } from "./zoom-controller.ts";
import { bindZoomKeys, ZOOM_STEP } from "./zoom-keys.ts";

export function bindGlassKeys(viewport: HTMLElement, zoom: ZoomController): void {
  bindZoomKeys(viewport, zoom, () => zoom.glideHome());
  for (const button of document.querySelectorAll<HTMLElement>("[data-zoom]")) {
    const step = button.dataset.zoom;
    button.addEventListener("click", () => {
      if (step === "in") zoom.glideBy(ZOOM_STEP);
      else if (step === "out") zoom.glideBy(1 / ZOOM_STEP);
      else zoom.glideHome();
    });
  }
  bindChartTouch(document.getElementById("zoom-touch"), (on) => zoom.takeTouch(on), pageTouchEnv());
}
