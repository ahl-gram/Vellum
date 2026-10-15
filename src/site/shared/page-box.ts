// The page's geometry: the 1024 floor (Issue #762 pull request C), where a room narrower than the floor lays out on a page the floor's width and scrolls sideways, and the desk frame (Issue #778), where a staged chart room on a page set small to fit the screen lays out 768 tall and scrolls down; a script that places a piece reads the page, never the window.
export const PAGE_FLOOR = 1024;

export function pageWidth(clientWidth: number): number {
  return Math.max(clientWidth, PAGE_FLOOR);
}

export function pageX(viewportX: number, scrollX: number): number {
  return viewportX + scrollX;
}

export function pageY(viewportY: number, scrollY: number): number {
  return viewportY + scrollY;
}

export const DESK_FRAME = "desk-frame";

export function deskFrameDue(scale: number): boolean {
  return scale < 1;
}

export interface PageBox {
  readonly w: number;
  readonly h: number;
}

/** The page a room lays out on: the floor's width at a narrower window, and the root's client height, which a sideways scrollbar shortens where `innerHeight` does not. */
export function pageBox(): PageBox {
  const root = document.documentElement;
  const frame = root.classList.contains(DESK_FRAME)
    ? parseFloat(getComputedStyle(root).getPropertyValue("--desk-frame-h"))
    : NaN;
  return { w: pageWidth(root.clientWidth), h: Number.isFinite(frame) ? frame : root.clientHeight };
}

export const pageLeft = (r: DOMRect): number => pageX(r.left, window.scrollX);
export const pageRight = (r: DOMRect): number => pageX(r.right, window.scrollX);
export const pageTop = (r: DOMRect): number => pageY(r.top, window.scrollY);
export const pageBottom = (r: DOMRect): number => pageY(r.bottom, window.scrollY);
