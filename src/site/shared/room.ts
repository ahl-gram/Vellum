// The chart room (#462, lifted into the Atelier Kit at its second use, #463/#487): the sheet fitted to what the chrome leaves, the slip's fold and the phone sheet, the legend row's seat. The Glass's keys and buttons are the page's own (glass-keys.ts for a plain controller, the Explorer's glass.ts for the LOD camera).
import { fitStage } from "./stage-fit.ts";
import { bindSlip } from "./slip.ts";
import { glassLeft, placeLegendRow, placeSlip, rectOf, slipWidth } from "./room-seats.ts";

const CHROME_GAP = 14;
const PHONE_GAP = 8;
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
  readonly sheet: HTMLElement;
  readonly camera: RoomCamera<Held>;
  readonly aspect?: () => number | null;
}

export interface Room {
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
  readonly legend: T;
  readonly dock: { appendChild(el: T): unknown };
  /** The row's place on the stage: its original parent and the sibling it stood before. */
  readonly stage: { insertBefore(el: T, before: object | null): unknown };
  readonly next: object | null;
}

export function dockLegend<T extends Seatable>(home: LegendHome<T>, seat: LegendSeat): void {
  const docked = home.legend.parentElement === home.dock;
  if (seat === "slip" && !docked) home.dock.appendChild(home.legend);
  else if (seat === "stage" && docked) home.stage.insertBefore(home.legend, home.next);
  home.legend.classList.toggle("in-slip", seat === "slip");
}

const q = <T extends HTMLElement = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel);

interface FitParts {
  readonly frame: HTMLElement;
  readonly sheet: HTMLElement;
  readonly aspect: number;
  readonly phone: boolean;
  readonly slipRect: DOMRect | null;
  readonly slipW: number;
  readonly glassL: number | null;
}

function fitRoom({ frame, sheet, aspect, phone, slipRect, slipW, glassL }: FitParts): void {
  const fit = fitStage({
    view: { w: window.innerWidth, h: window.innerHeight },
    aspect,
    above: bottoms([q("header.chrome"), phone ? null : q(".corner.tr")]),
    below: [...tops([q(".corner.bl"), q(".legend:not(.in-slip)"), q(".strip")]), ...(phone && slipRect !== null ? [slipRect.top] : [])],
    beside: slipW,
    right: slipW > 0 && glassL !== null ? [glassL] : [],
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
}
const tops = (els: Array<Element | null>) => els.map(rectOf).flatMap((r) => (r === null ? [] : [r.top]));
const bottoms = (els: Array<Element | null>) => els.map(rectOf).flatMap((r) => (r === null ? [] : [r.bottom]));

export function bindRoom<Held>(parts: RoomParts<Held>): Room {
  const { frame, sheet, camera } = parts;
  const narrowQuery = window.matchMedia(NARROW);
  const slip = q(".slip");
  const legend = q(".legend");
  const dock = slip?.querySelector<HTMLElement>(".legend-dock") ?? null;
  const home = legend !== null && dock !== null && legend.parentElement !== null
    ? { legend, dock, stage: legend.parentElement, next: legend.nextSibling }
    : null;

  const svgAspect = () => {
    const vb = (sheet.querySelector<SVGSVGElement>("svg[data-vellum-style]") ?? sheet.querySelector<SVGSVGElement>("svg"))?.viewBox.baseVal;
    return vb !== undefined && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : FALLBACK_ASPECT;
  };
  const aspect = () => parts.aspect?.() ?? svgAspect();

  const layout = () => {
    const held = camera.hold();
    const phone = narrowQuery.matches;
    if (home !== null) dockLegend<HTMLElement>(home, legendSeat({ narrow: phone, hasSlip: true }));
    if (slip !== null && !phone) placeSlip(slip, q(".corner.tr"), q(".strip"));
    else if (slip !== null) slip.style.top = slip.style.maxHeight = "";
    // A slip hidden with the engine's panel (the Reading Room's, between reads) has an all-zero rect: read as absent, or a phone reserves the whole viewport for a sheet that is not there (skeptic on PR #492).
    const slipRect = slip !== null ? rectOf(slip) : null;
    const slipOpen = slip !== null && !slip.classList.contains("folded") && !phone;
    const slipW = slipOpen ? slipWidth(slipRect) : 0;
    const glassL = glassLeft(q(".corner.br"), slipOpen, slipW);
    if (legend !== null && !phone) placeLegendRow(legend, { folio: q(".corner.bl"), chrome: q("header.chrome"), glass: glassL, slip: slipOpen ? slipRect : null });
    fitRoom({ frame, sheet, aspect: aspect(), phone, slipRect, slipW, glassL });
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
