// The chart room's seats (Issue #462), the measured placements bindRoom runs on every layout: the slip below the folio and above a strip, the legend row centred in the room the chart folio, the Glass and an open slip leave it.
const SLIP_TOP_GAP = 16;
const SLIP_FLOOR = 22;
const STRIP_GAP = 12;
const LEGEND_CLEAR = 32;
const LEGEND_GAP = 16;
const LEGEND_RISE = 12;
const SAME_LINE = 1;

export const rectOf = (el: Element | null): DOMRect | null => {
  if (el === null) return null;
  const r = el.getBoundingClientRect();
  return r.height > 0 ? r : null;
};

// A wrapped line reads as the box, so a short survey line leaves the legend more room than the box's max-width would.
export function textRight(el: Element | null): number | null {
  if (el === null) return null;
  const range = document.createRange();
  let right: number | null = null;
  for (const p of el.querySelectorAll("p")) {
    if (!p.textContent) continue;
    range.selectNodeContents(p);
    const r = range.getBoundingClientRect();
    if (r.width > 0) right = Math.max(right ?? 0, r.right);
  }
  return right;
}

/** The slip hangs below the room's folio; a room with a bottom strip (the Reading Room's instrument) floors it at the strip, not the viewport. */
export function placeSlip(slipEl: HTMLElement, folio: Element | null, strip: Element | null): void {
  const top = (rectOf(folio)?.bottom ?? 0) + SLIP_TOP_GAP;
  const stripRect = rectOf(strip);
  const floor = stripRect !== null ? stripRect.top - STRIP_GAP : window.innerHeight - SLIP_FLOOR;
  slipEl.style.top = `${top}px`;
  slipEl.style.maxHeight = `${floor - top}px`;
}

/** A slip standing inside a hidden panel (the Reading Room's, between reads) has no rect; its width is still the sheet's, so the chart does not jump wide and back on every read. */
export function slipWidth(r: DOMRect | null): number {
  if (r !== null && r.width > 0) return r.width;
  const rootStyle = getComputedStyle(document.documentElement);
  return parseFloat(rootStyle.getPropertyValue("--slip-w")) * parseFloat(rootStyle.fontSize) || 0;
}

// atelier.css seats the Glass beside an open slip at right: --slip-w + 2rem + 1.4rem; computed here rather than read, because the Glass's right transitions with the fold and a rect read at the settle timer was 12px short (e2e Z13c).
export const GLASS_GAP_REM = 3.4;

export function glassLeft(glass: HTMLElement | null, slipOpen: boolean, slipW: number): number | null {
  if (glass === null) return null;
  if (!slipOpen) return rectOf(glass)?.left ?? null;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return window.innerWidth - slipW - GLASS_GAP_REM * rem - glass.offsetWidth;
}

export interface LegendRoom {
  readonly folio: Element | null;
  readonly chrome: Element | null;
  readonly glass: number | null;
  readonly slip: DOMRect | null;
}

export function pressRowStacks(tops: readonly number[]): boolean {
  if (tops.length < 2) return false;
  const sorted = [...tops].sort((a, b) => a - b);
  const lines = 1 + sorted.slice(1).filter((top, i) => top - sorted[i]! > SAME_LINE).length;
  return lines > 2 || lines === tops.length;
}

// Computed, never read back off the row: its left transitions, and a mid-transition rect reads the old seat (plate read 2026-08-29: a resize left the row over the folio).
export function placeLegendRow(legendEl: HTMLElement, room: LegendRoom): void {
  for (const prop of ["bottom", "transform", "transition"] as const) legendEl.style[prop] = "";
  const chromeX = rectOf(room.chrome)?.left ?? 0;
  const left = (textRight(room.folio) ?? chromeX) + LEGEND_CLEAR;
  const bound = Math.min(window.innerWidth - chromeX, room.glass ?? Infinity, room.slip?.left ?? Infinity) - LEGEND_GAP;
  const space = Math.max(0, bound - left);
  legendEl.style.maxWidth = `${space}px`;
  legendEl.style.left = `${left + space / 2}px`;
  const tops = [...legendEl.querySelectorAll(".legend-row .legend-btn")].map((b) => b.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => r.top);
  const folio = rectOf(room.folio);
  if (folio === null || !pressRowStacks(tops)) return;
  Object.assign(legendEl.style, { transition: "none", transform: "none", left: `${chromeX}px`, maxWidth: `${Math.max(0, bound - chromeX)}px`, bottom: `${window.innerHeight - folio.top + LEGEND_RISE}px` });
}
