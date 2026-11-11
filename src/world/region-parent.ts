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
  const ww = parentW - 1;
  const wh = parentH - 1;
  return {
    box: { x0: window.u0 * ww, x1: window.u1 * ww, y0: window.v0 * wh, y1: window.v1 * wh },
    toRegion: (p) => ({
      x: ((p.x / ww - window.u0) / (window.u1 - window.u0)) * (gridW - 1),
      y: ((p.y / wh - window.v0) / (window.v1 - window.v0)) * (gridH - 1),
    }),
  };
}

export function clipSegment(a: Pt, b: Pt, box: WindowBox): readonly [number, number] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: ReadonlyArray<readonly [number, number]> = [
    [-dx, a.x - box.x0],
    [dx, box.x1 - a.x],
    [-dy, a.y - box.y0],
    [dy, box.y1 - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  return [t0, t1];
}
