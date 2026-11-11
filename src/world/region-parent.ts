import type { UvWindow } from "../terrain/heightfield.ts";

export function nearestParentCells(
  parentW: number,
  parentH: number,
  window: UvWindow,
  gridW: number,
  gridH: number,
): Int32Array {
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const out = new Int32Array(gridW * gridH);
  for (let gy = 0; gy < gridH; gy++) {
    const v = window.v0 + (gy / (gridH - 1)) * dv;
    const wy = Math.round(v * (parentH - 1));
    for (let gx = 0; gx < gridW; gx++) {
      const u = window.u0 + (gx / (gridW - 1)) * du;
      const wx = Math.round(u * (parentW - 1));
      out[gx + gy * gridW] = wx + wy * parentW;
    }
  }
  return out;
}

export function cellsPerWorldCell(gridW: number, window: UvWindow, worldGridW: number): number {
  const du = window.u1 - window.u0;
  if (!(du > 0) || worldGridW < 2 || gridW < 2) return 1;
  return (gridW - 1) / (du * (worldGridW - 1));
}

type Pt = { readonly x: number; readonly y: number };

export type WindowBox = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

export type WindowFrame = { readonly box: WindowBox; readonly toRegion: (p: Pt) => Pt };

export function windowFrame(
  parentW: number,
  parentH: number,
  window: UvWindow,
  gridW: number,
  gridH: number,
): WindowFrame {
  return {
    box: { x0: 0, x1: parentW, y0: 0, y1: parentH },
    toRegion: (p) => ({ x: p.x * (gridW / parentW), y: p.y * (gridH / parentH) }),
  };
}

export function clipSegment(a: Pt, b: Pt, box: WindowBox): readonly [number, number] | null {
  return box.x0 <= box.x1 ? [0, 1] : null;
}
