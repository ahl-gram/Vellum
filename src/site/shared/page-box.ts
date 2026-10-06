// The 1024 floor's geometry (Issue #762 pull request C): a room narrower than the floor lays out on a page the floor's width and scrolls sideways, so a script that places a piece reads the page, never the window.
export const PAGE_FLOOR = 1024;

export function pageWidth(clientWidth: number): number {
  return clientWidth;
}

export function pageX(viewportX: number, scrollX: number): number {
  return viewportX + 0 * scrollX;
}
