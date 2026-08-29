// The chart room's furniture (#462): the stage fitted to what the chrome leaves, the slip's fold, the Glass's keys and buttons. app.ts keeps the hunt and the controller; this file keeps the room.
import { fitStage } from "../shared/stage-fit.ts";
import { bindSlip } from "../shared/slip.ts";
import type { ZoomController } from "../shared/zoom-controller.ts";

// The Explorer's own steps (src/site/explorer/glass.ts), not imported: that module carries the LOD schedule the Hunt must never bundle (#161).
const ZOOM_STEP = 1.4;
const PAN_FRACTION = 0.15;
const CHROME_GAP = 14;
const PHONE_GAP = 8;
const SLIP_TOP_GAP = 16;
const SLIP_FLOOR = 22;
const NARROW = "(max-width: 900px)";
const FALLBACK_ASPECT = 1500 / 1157.931;

interface RoomParts {
  readonly viewport: HTMLElement;
  readonly map: HTMLElement;
  readonly sheet: HTMLElement;
  readonly zoom: ZoomController;
}

export interface Room {
  /** Re-measure the chrome and refit the sheet; call after the chart is drawn and whenever the furniture moves. */
  readonly layout: () => void;
}

export function bindRoom({ viewport, map, sheet, zoom }: RoomParts): Room {
  const narrowQuery = window.matchMedia(NARROW);
  const narrow = () => narrowQuery.matches;
  const q = <T extends HTMLElement = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel);
  const rect = (el: Element | null): DOMRect | null => {
    if (el === null) return null;
    const r = el.getBoundingClientRect();
    return r.height > 0 ? r : null;
  };
  const slip = q(".slip");
  const folio = q(".corner.tr");

  const placeSlip = () => {
    if (slip === null) return;
    if (narrow()) {
      slip.style.top = "";
      slip.style.maxHeight = "";
      return;
    }
    const top = (rect(folio)?.bottom ?? 0) + SLIP_TOP_GAP;
    slip.style.top = `${top}px`;
    slip.style.maxHeight = `${window.innerHeight - top - SLIP_FLOOR}px`;
  };

  // The legend row centres on the chart, but never over the chart's folio.
  const clearLegend = () => {
    const legend = q(".legend:not(.in-slip)");
    if (legend === null || narrow()) return;
    legend.style.left = "";
    const a = legend.getBoundingClientRect();
    const bl = rect(q(".corner.bl"));
    if (bl !== null && a.left < bl.right + 32) {
      legend.style.left = `${a.left + a.width / 2 + (bl.right + 32 - a.left)}px`;
    }
  };

  const aspect = () => {
    const vb = sheet.querySelector("svg")?.viewBox.baseVal;
    return vb !== undefined && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : FALLBACK_ASPECT;
  };

  const layout = () => {
    placeSlip();
    const phone = narrow();
    const slipRect = slip !== null ? slip.getBoundingClientRect() : null;
    const slipOpen = slip !== null && !slip.classList.contains("folded") && !phone;
    const tops = (els: Array<Element | null>) => els.map(rect).flatMap((r) => (r === null ? [] : [r.top]));
    const fit = fitStage({
      view: { w: window.innerWidth, h: window.innerHeight },
      aspect: aspect(),
      above: [rect(q("header.chrome")), phone ? null : rect(folio)].flatMap((r) => (r === null ? [] : [r.bottom])),
      below: [...tops([q(".corner.bl"), q(".legend:not(.in-slip)")]), ...(phone && slipRect !== null ? [slipRect.top] : [])],
      beside: slipOpen && slipRect !== null ? slipRect.width : 0,
      gap: phone ? PHONE_GAP : CHROME_GAP,
      narrow: phone,
    });
    map.style.padding = `${fit.reserve.top}px ${fit.reserve.right}px ${fit.reserve.bottom}px 0`;
    sheet.style.width = `${fit.sheet.w}px`;
    sheet.style.height = `${fit.sheet.h}px`;
    if (phone && slipRect !== null) document.body.style.setProperty("--sheet-h", `${window.innerHeight - slipRect.top}px`);
    else document.body.style.removeProperty("--sheet-h");
    clearLegend();
    // A resize or a fold changes the stage d3 clamps against; re-clamping the standing transform keeps the sheet on the stage.
    zoom.zoomTo(zoom.getState());
  };

  if (slip !== null) {
    bindSlip({
      slip,
      fold: slip.querySelector(".slip-fold"),
      tab: q(".slip-tab"),
      head: slip.querySelector(".slip-head") ?? slip,
      narrow,
      onLayout: layout,
      after: (run, ms) => { window.setTimeout(run, ms); },
    });
  }

  // #165/#170: keys and buttons enter d3-zoom's own pipeline through the controller, the Explorer's wiring.
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

  window.addEventListener("resize", layout);
  narrowQuery.addEventListener("change", layout);
  document.fonts?.ready.then(layout);
  return { layout };
}
