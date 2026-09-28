import type { Cam } from "../../support/home.ts";
import type { Payload, Point } from "../../types.ts";

export type Headroom = { cx: number; cy: number; w: number; h: number };
export const stagePoint: Payload<Point | null> = `(() => { const s = document.getElementById("lf-stage"); if (!s) return null; const r = s.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`;
export const down = (y: number, y0: number) => y > y0;
export const stillCam = (a: Cam | null, b: Cam | null) =>
  a !== null && b !== null && Math.abs(b.scale - a.scale) < a.scale * 0.02 && Math.abs(b.x - a.x) < 8 && Math.abs(b.y - a.y) < 8;
export const roomy = (hr: Headroom | null) => hr !== null && hr.cx > 50 && hr.cx < hr.w - 50 && hr.cy > 50 && hr.cy < hr.h - 50;
// Ruling 3 on #475: at a limit the arm picks the drag direction FROM measured headroom and proves the room exists, instead of assuming an unparked centre.
export const roomDir = (hr: Headroom | null) => {
  if (hr === null) return null;
  const sx = hr.w - hr.cx >= hr.cx ? 1 : -1;
  const sy = hr.h - hr.cy >= hr.cy ? 1 : -1;
  const roomX = sx > 0 ? hr.w - hr.cx : hr.cx;
  const roomY = sy > 0 ? hr.h - hr.cy : hr.cy;
  return roomX > 100 && roomY > 60 ? { sx, sy } : null;
};
