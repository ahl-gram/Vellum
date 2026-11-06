// The chart room (Issue #462, lifted into the Atelier Kit at its second use, Issue #463/Issue #487): the sheet fitted to what the chrome leaves on the room's page (at least 1024 wide, and 768 tall in the desk frame, page-box.ts), the slip's fold, the legend row's seat. The Glass's keys and buttons are the page's own (glass-keys.ts for a plain controller, the Explorer's glass.ts for the LOD camera).
import { CHROME_GAP, fitStage, holdsSheet } from "./stage-fit.ts";
import { bindSlip, type SlipFold } from "./slip.ts";
import { createSheetSlide, type SheetSlide } from "./sheet-slide.ts";
import { prefersReduce } from "./reduced-motion.ts";
import { DESK_FRAME, deskFrameDue, pageBottom, pageBox, pageTop } from "./page-box.ts";
import { glassLeft, placeLegendRow, placeSlip, rectOf, slipInset, slipWidth } from "./room-seats.ts";

const FALLBACK_ASPECT = 1500 / 1157.931;

/** The camera's framing, held across a refit: the fit changes the box the camera is clamped against, so re-applying a raw transform against the new box would move the framing (and on the Explorer, re-draft a different region on the settle). */
export interface RoomCamera<Held> {
  readonly hold: () => Held;
  readonly restore: (held: Held) => void;
}

export interface RoomParts<Held> {
  /** The element that reserves the chrome's edges as padding (Today: #map, the transform target; the Explorer: the stage round its sheet). */
  readonly frame: HTMLElement;
  readonly sheet: HTMLElement;
  readonly camera: RoomCamera<Held>;
  readonly aspect?: () => number | null;
  readonly onLayout?: () => void;
}

export interface Room {
  readonly layout: () => void;
  /** Null on a page with no slip. The Explorer's Chart Table folds the Broadside when it opens (Issue #543). */
  readonly broadside: SlipFold | null;
}

const q = <T extends HTMLElement = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel);

interface FitParts {
  readonly frame: HTMLElement;
  readonly sheet: HTMLElement;
  readonly aspect: number;
  readonly slipReach: number;
  readonly glassL: number | null;
}

function heldStill(els: readonly HTMLElement[], write: () => void): void {
  for (const el of els) el.style.transition = "none";
  write();
  els[0]?.getBoundingClientRect();
  for (const el of els) el.style.transition = "";
}

function fitRoom({ frame, sheet: sheetEl, aspect, slipReach, glassL }: FitParts): boolean {
  const fit = fitStage({
    view: pageBox(),
    aspect,
    above: bottoms([q("header.chrome"), q(".corner.tr")]),
    below: tops([q(".corner.bl"), q(".legend"), q(".strip")]),
    beside: slipReach,
    right: slipReach > 0 && glassL !== null ? [glassL] : [],
    gap: CHROME_GAP,
  });
  if (!holdsSheet(fit)) return false;
  heldStill([frame, sheetEl], () => {
    frame.style.setProperty("--reserve-top", `${fit.reserve.top}px`);
    frame.style.setProperty("--reserve-right", `${fit.reserve.right}px`);
    frame.style.setProperty("--reserve-bottom", `${fit.reserve.bottom}px`);
    sheetEl.style.width = `${fit.sheet.w}px`;
    sheetEl.style.height = `${fit.sheet.h}px`;
  });
  document.body.classList.toggle("stage-under", fit.under);
  return true;
}

function refitOnChrome(layout: () => void): void {
  const observer = new ResizeObserver(() => {
    layout();
  });
  for (const el of [q("header.chrome"), q(".corner.tr")]) if (el !== null) observer.observe(el);
}

const tops = (els: Array<Element | null>) => els.map(rectOf).flatMap((r) => (r === null ? [] : [pageTop(r)]));
const bottoms = (els: Array<Element | null>) => els.map(rectOf).flatMap((r) => (r === null ? [] : [pageBottom(r)]));

function roomLayout<Held>(parts: RoomParts<Held>, slip: HTMLElement | null, slide: SheetSlide): () => void {
  const { frame, sheet, camera } = parts;
  const legend = q(".legend");

  const svgAspect = () => {
    const vb = (
      sheet.querySelector<SVGSVGElement>("svg[data-vellum-style]") ?? sheet.querySelector<SVGSVGElement>("svg")
    )?.viewBox.baseVal;
    return vb !== undefined && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : FALLBACK_ASPECT;
  };
  const aspect = () => parts.aspect?.() ?? svgAspect();

  return () => {
    slide.stop();
    const held = camera.hold();
    if (slip !== null) placeSlip(slip, q(".corner.tr"), q(".strip"));
    // A slip hidden with the engine's panel (the Reading Room's, between reads) has an all-zero rect, so its width is read from the token.
    const slipRect = slip !== null ? rectOf(slip) : null;
    const slipOpen = slip !== null && !slip.classList.contains("folded");
    const slipW = slipOpen ? slipWidth(slipRect) : 0;
    const slipReach = slipOpen ? slipW + slipInset(slip) : 0;
    const glassL = glassLeft(q(".corner.br"), slipOpen, slipReach);
    if (legend !== null)
      placeLegendRow(legend, {
        folio: q(".corner.bl"),
        chrome: q("header.chrome"),
        glass: glassL,
        slip: slipOpen ? slipRect : null,
      });
    if (fitRoom({ frame, sheet, aspect: aspect(), slipReach, glassL })) camera.restore(held);
    parts.onLayout?.();
  };
}

export function bindRoom<Held>(parts: RoomParts<Held>): Room {
  document.documentElement.classList.toggle(DESK_FRAME, deskFrameDue(window.visualViewport?.scale ?? 1));
  const slide = createSheetSlide(parts.sheet);
  const slip = q(".slip");
  const layout = roomLayout(parts, slip, slide);
  const fold = (): void => {
    const from = parts.sheet.getBoundingClientRect();
    layout();
    void slide.slide(from, prefersReduce()).then((done) => {
      if (done) layout();
    });
  };
  const broadside: SlipFold | null =
    slip === null
      ? null
      : bindSlip({ slip, fold: slip.querySelector(".slip-fold"), tab: q(".slip-tab"), onFold: fold });
  window.addEventListener("resize", layout);
  refitOnChrome(layout);
  void document.fonts?.ready.then(layout); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  return { layout, broadside };
}
