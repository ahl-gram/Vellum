import type { P } from "../simplify.ts";

export const ASPECT = 319 / 239;
export const INSET = 0.06;
export const CELL = 1 / 239;

export type Box = { readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number };

export function boxOf(rings: readonly (readonly P[])[]): Box {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const ring of rings)
    for (const [x, y] of ring) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  return { x0, y0, x1, y1 };
}

export function fitScale(b: Box): number {
  return Math.min(((1 - 2 * INSET) * ASPECT) / (b.x1 - b.x0), (1 - 2 * INSET) / (b.y1 - b.y0));
}

export function diagonal2(b: Box): number {
  return (b.x1 - b.x0) * (b.x1 - b.x0) + (b.y1 - b.y0) * (b.y1 - b.y0);
}

export function gap2(a: Box, b: Box): number {
  const dx = Math.max(0, a.x0 - b.x1, b.x0 - a.x1);
  const dy = Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
  return dx * dx + dy * dy;
}

export function ringArea(ring: readonly P[]): number {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!,
      b = ring[(i + 1) % ring.length]!;
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}
