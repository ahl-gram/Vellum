import { createField } from "../src/core/grid.ts";
import type { Settlement } from "../src/society/sites.ts";

export type Rect = { x0: number; y0: number; x1: number; y1: number };
const inRect = (x: number, y: number, r: Rect) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;

export function land(w: number, h: number, rects: ReadonlyArray<Rect>) {
  return createField(w, h, (x, y) => (rects.some((r) => inRect(x, y, r)) ? 1 : 0));
}
export function settle(x: number, y: number, kind: Settlement["kind"], score = 1): Settlement {
  return { x, y, kind, harbor: false, onRiver: false, score };
}
export const noRivers = (w: number, h: number) => new Uint8Array(w * h);
