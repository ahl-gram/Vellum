// The chart room (#462, lifted into the Atelier Kit at its second use, #463/#487): the sheet fitted to what the chrome leaves, the slip's fold and the phone sheet, the legend row's seat. The Glass's keys and buttons are the page's own (glass-keys.ts for a plain controller, the Explorer's glass.ts for the LOD camera).
import { fitStage } from "./stage-fit.ts";
import { bindSlip } from "./slip.ts";

const CHROME_GAP = 14;
const PHONE_GAP = 8;
const SLIP_TOP_GAP = 16;
const SLIP_FLOOR = 22;
const LEGEND_CLEAR = 32;
const NARROW = "(max-width: 900px)";
const FALLBACK_ASPECT = 1500 / 1157.931;

/** The camera's framing, held across a refit: the fit changes the box the camera is clamped against, so re-applying a raw transform against the new box would move the framing (and on the Explorer, re-draft a different region on the settle). */
export interface RoomCamera<Held> {
  readonly hold: () => Held;
  readonly restore: (held: Held) => void;
}

interface RoomParts<Held> {
  /** The element that reserves the chrome's edges as padding (Today: #map, the transform target; the Explorer: the stage round its sheet). */
  readonly frame: HTMLElement;
  /** The chart's fitted box. */
  readonly sheet: HTMLElement;
  readonly camera: RoomCamera<Held>;
}

export interface Room {
  /** Re-measure the chrome and refit the sheet; call after the chart is drawn and whenever the furniture moves. */
  readonly layout: () => void;
}

export type LegendSeat = "stage" | "slip";

export function legendSeat(at: { narrow: boolean; hasSlip: boolean }): LegendSeat {
  return at.narrow && at.hasSlip ? "slip" : "stage";
}

export interface Seatable {
  readonly parentElement: object | null;
  readonly classList: { toggle(c: string, force: boolean): boolean };
}

export interface LegendHome<T extends Seatable = Seatable> {
  /** The legend row itself. */
  readonly legend: T;
  /** The slip's dock, where the row sits on a phone. */
  readonly dock: { appendChild(el: T): unknown };
  /** The row's place on the stage: its original parent and the sibling it stood before. */
  readonly stage: { insertBefore(el: T, before: object | null): unknown };
  readonly next: object | null;
}

/** Move the one legend row to its seat, idempotently; the in-slip class follows it so the sheet dresses it in place. */
export function dockLegend<T extends Seatable>(home: LegendHome<T>, seat: LegendSeat): void {
  const docked = home.legend.parentElement === home.dock;
  if (seat === "slip" && !docked) home.dock.appendChild(home.legend);
  else if (seat === "stage" && docked) home.stage.insertBefore(home.legend, home.next);
  home.legend.classList.toggle("in-slip", seat === "slip");
}

export function bindRoom<Held>({ frame, sheet, camera }: RoomParts<Held>): Room {
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
  const legend = q(".legend");
  const legendStage = legend?.parentElement ?? null;
  const legendNext = legend?.nextSibling ?? null;
  const legendDock = slip?.querySelector(".legend-dock") ?? null;

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

  const seatLegend = () => {
    if (legend === null || legendStage === null || legendDock === null) return;
    dockLegend<HTMLElement>({ legend, dock: legendDock, stage: legendStage, next: legendNext }, legendSeat({ narrow: narrow(), hasSlip: slip !== null }));
  };

  // The legend row centres on the chart, but never over the chart's folio.
  const clearLegend = () => {
    if (legend === null || narrow()) return;
    legend.style.left = "";
    const a = legend.getBoundingClientRect();
    const bl = rect(q(".corner.bl"));
    if (bl !== null && a.left < bl.right + LEGEND_CLEAR) {
      legend.style.left = `${a.left + a.width / 2 + (bl.right + LEGEND_CLEAR - a.left)}px`;
    }
  };

  const aspect = () => {
    const vb = (sheet.querySelector<SVGSVGElement>("svg[data-vellum-style]") ?? sheet.querySelector<SVGSVGElement>("svg"))?.viewBox.baseVal;
    return vb !== undefined && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : FALLBACK_ASPECT;
  };

  const layout = () => {
    const held = camera.hold();
    seatLegend();
    placeSlip();
    const phone = narrow();
    const slipRect = slip !== null ? slip.getBoundingClientRect() : null;
    const slipOpen = slip !== null && !slip.classList.contains("folded") && !phone;
    const tops = (els: Array<Element | null>) => els.map(rect).flatMap((r) => (r === null ? [] : [r.top]));
    const fit = fitStage({
      view: { w: window.innerWidth, h: window.innerHeight },
      aspect: aspect(),
      above: [rect(q("header.chrome")), phone ? null : rect(folio)].flatMap((r) => (r === null ? [] : [r.bottom])),
      below: [...tops([q(".corner.bl"), q(".legend:not(.in-slip)"), q(".strip")]), ...(phone && slipRect !== null ? [slipRect.top] : [])],
      beside: slipOpen && slipRect !== null ? slipRect.width : 0,
      gap: phone ? PHONE_GAP : CHROME_GAP,
      narrow: phone,
    });
    frame.style.setProperty("--reserve-top", `${fit.reserve.top}px`);
    frame.style.setProperty("--reserve-right", `${fit.reserve.right}px`);
    frame.style.setProperty("--reserve-bottom", `${fit.reserve.bottom}px`);
    sheet.style.width = `${fit.sheet.w}px`;
    sheet.style.height = `${fit.sheet.h}px`;
    if (phone && slipRect !== null) document.body.style.setProperty("--sheet-h", `${window.innerHeight - slipRect.top}px`);
    else document.body.style.removeProperty("--sheet-h");
    clearLegend();
    camera.restore(held);
  };

  if (slip !== null) {
    bindSlip({
      slip,
      fold: slip.querySelector(".slip-fold"),
      tab: q(".slip-tab"),
      handle: slip.querySelector(".slip-handle"),
      onLayout: layout,
      after: (run, ms) => { window.setTimeout(run, ms); },
    });
  }

  window.addEventListener("resize", layout);
  narrowQuery.addEventListener("change", layout);
  document.fonts?.ready.then(layout);
  return { layout };
}
