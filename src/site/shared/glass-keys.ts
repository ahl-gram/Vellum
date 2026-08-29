// The Surveyor's Glass on a plain controller (#167, the Hunt; lifted at #463 for the rooms whose camera is purely geometric): keys and buttons enter d3-zoom's own pipeline through the controller, the Explorer's wiring (#165/#170). The Explorer keeps its own in glass.ts, where the home glide also eases the LOD camera.
import type { ZoomController } from "./zoom-controller.ts";

// The Explorer's own steps (src/site/explorer/glass.ts), not imported: that module carries the LOD schedule the Hunt must never bundle (#161).
const ZOOM_STEP = 1.4;
const PAN_FRACTION = 0.15;

export function bindGlassKeys(viewport: HTMLElement, zoom: ZoomController): void {
  viewport.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const W = viewport.clientWidth;
    const H = viewport.clientHeight;
    switch (e.key) {
      case "+": case "=": zoom.glideBy(ZOOM_STEP); break;
      case "-": case "_": zoom.glideBy(1 / ZOOM_STEP); break;
      case "ArrowLeft": zoom.panBy(W * PAN_FRACTION, 0); break;
      case "ArrowRight": zoom.panBy(-W * PAN_FRACTION, 0); break;
      case "ArrowUp": zoom.panBy(0, H * PAN_FRACTION); break;
      case "ArrowDown": zoom.panBy(0, -H * PAN_FRACTION); break;
      case "0": zoom.glideHome(); break;
      default: return;
    }
    e.preventDefault();
  });
  for (const button of document.querySelectorAll<HTMLElement>("[data-zoom]")) {
    const step = button.dataset.zoom;
    button.addEventListener("click", () => {
      if (step === "in") zoom.glideBy(ZOOM_STEP);
      else if (step === "out") zoom.glideBy(1 / ZOOM_STEP);
      else zoom.glideHome();
    });
  }
}
