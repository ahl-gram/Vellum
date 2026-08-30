// The chart room's seats (#462), the measured placements bindRoom runs on every layout: the slip below the folio and above a strip, the legend row centred in the room the chart folio, the Glass and an open slip leave it.
const SLIP_TOP_GAP = 16;
const SLIP_FLOOR = 22;
const STRIP_GAP = 12;
const LEGEND_CLEAR = 32;
const LEGEND_GAP = 16;

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
export function placeSlip(slip: HTMLElement, folio: Element | null, strip: Element | null): void {
  const top = (rectOf(folio)?.bottom ?? 0) + SLIP_TOP_GAP;
  const stripRect = rectOf(strip);
  const floor = stripRect !== null ? stripRect.top - STRIP_GAP : window.innerHeight - SLIP_FLOOR;
  slip.style.top = `${top}px`;
  slip.style.maxHeight = `${floor - top}px`;
}

/** A slip standing inside a hidden panel (the Reading Room's, between reads) has no rect; its width is still the sheet's, so the chart does not jump wide and back on every read. */
export function slipWidth(r: DOMRect | null): number {
  if (r !== null && r.width > 0) return r.width;
  const rootStyle = getComputedStyle(document.documentElement);
  return parseFloat(rootStyle.getPropertyValue("--slip-w")) * parseFloat(rootStyle.fontSize) || 0;
}

// atelier.css seats the Glass beside an open slip at right: --slip-w + 2rem + 1.4rem; computed here rather than read, because the Glass's right transitions with the fold and a rect read at the settle timer was 12px short (e2e Z13c).
export const GLASS_GAP_REM = 3.4;

/** The Glass's left edge: beside an open slip by the sheet's own arithmetic, else where it stands. */
export function glassLeft(glass: HTMLElement | null, slipOpen: boolean, slipW: number): number | null {
  if (glass === null) return null;
  if (!slipOpen) return rectOf(glass)?.left ?? null;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return window.innerWidth - slipW - GLASS_GAP_REM * rem - glass.offsetWidth;
}

export interface LegendRoom {
  readonly folio: Element | null;
  readonly chrome: Element | null;
  /** The Glass's left edge (glassLeft), null with no Glass. */
  readonly glass: number | null;
  /** The open slip's rect, null when folded or a bottom sheet. */
  readonly slip: DOMRect | null;
}

// Computed, never read back off the row: its left transitions, and a mid-transition rect reads the old seat (plate read 2026-08-29: a resize left the row over the folio).
export function placeLegendRow(legend: HTMLElement, room: LegendRoom): void {
  const chromeX = rectOf(room.chrome)?.left ?? 0;
  const left = (textRight(room.folio) ?? chromeX) + LEGEND_CLEAR;
  const bounds = [window.innerWidth - chromeX, room.glass ?? Infinity, room.slip?.left ?? Infinity];
  const space = Math.max(0, Math.min(...bounds) - LEGEND_GAP - left);
  legend.style.maxWidth = `${space}px`;
  legend.style.left = `${left + space / 2}px`;
}
