import type { UvWindow } from "../terrain/heightfield.ts";

/** For every region cell `gx + gy * gridW`, the index `wx + wy * parentW` of its nearest parent cell. */
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

/** Region cells per parent cell along a row; 1 for a degenerate window or grid, the guard `landSnapRadius` uses. */
export function cellsPerWorldCell(gridW: number, window: UvWindow, worldGridW: number): number {
  const du = window.u1 - window.u0;
  if (!(du > 0) || worldGridW < 2 || gridW < 2) return 1;
  return (gridW - 1) / (du * (worldGridW - 1));
}
