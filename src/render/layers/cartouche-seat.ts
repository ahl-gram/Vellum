import type { Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";

export const CARTOUCHE_SCALES = [1, 0.9, 0.8] as const;
export type CartoucheScale = (typeof CARTOUCHE_SCALES)[number];

const SEAT_INSET = 20;

export function landCellsUnder(ctx: RenderCtx, box: Box): number {
  const { proj, world } = ctx;
  const { w, h, data } = world.elev;
  const gx0 = Math.max(0, Math.floor((box.x - proj.margin) / proj.scale) - 1);
  const gx1 = Math.min(w - 1, Math.ceil((box.x + box.w - proj.margin) / proj.scale) + 1);
  const gy0 = Math.max(0, Math.floor((box.y - proj.margin) / proj.scale) - 1);
  const gy1 = Math.min(h - 1, Math.ceil((box.y + box.h - proj.margin) / proj.scale) + 1);
  let n = 0;
  for (let gy = gy0; gy <= gy1; gy++) {
    const py = proj.py(gy);
    if (py < box.y || py > box.y + box.h) continue;
    for (let gx = gx0; gx <= gx1; gx++) {
      const px = proj.px(gx);
      if (px >= box.x && px <= box.x + box.w && (data[gx + gy * w] as number) > world.seaLevel) n++;
    }
  }
  return n;
}

export function cornerSeats(ctx: RenderCtx, width: number, height: number): Box[] {
  const { proj } = ctx;
  const inset = SEAT_INSET * (proj.widthPx / 1500);
  const left = proj.margin + inset;
  const right = proj.widthPx - proj.margin - inset - width;
  const top = proj.margin + inset;
  const bottom = proj.heightPx - proj.margin - inset - height;
  return [
    { x: right, y: top, w: width, h: height },
    { x: left, y: top, w: width, h: height },
    { x: right, y: bottom, w: width, h: height },
    { x: left, y: bottom, w: width, h: height },
  ];
}

export function seatOnSea(_ctx: RenderCtx, chosen: Box): { readonly rect: Box; readonly scale: CartoucheScale } {
  return { rect: chosen, scale: 1 };
}
