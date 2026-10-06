// The 1024 floor's geometry (Issue #762 pull request C): a room narrower than the floor lays out on a page the floor's width and scrolls sideways, so a script that places a piece reads the page, never the window.
export const PAGE_FLOOR = 1024;

export function pageWidth(clientWidth: number): number {
  return Math.max(clientWidth, PAGE_FLOOR);
}

export function pageX(viewportX: number, scrollX: number): number {
  return viewportX + scrollX;
}

export interface PageBox {
  readonly w: number;
  readonly h: number;
}

/** The page a room lays out on: the floor's width at a narrower window, and the root's client height, which a sideways scrollbar shortens where `innerHeight` does not. */
export function pageBox(): PageBox {
  const root = document.documentElement;
  return { w: pageWidth(root.clientWidth), h: root.clientHeight };
}

export const pageLeft = (r: DOMRect): number => pageX(r.left, window.scrollX);
export const pageRight = (r: DOMRect): number => pageX(r.right, window.scrollX);
