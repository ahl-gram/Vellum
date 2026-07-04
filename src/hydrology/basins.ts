import { NEIGHBORS_4, type Field } from "../core/grid.ts";
import type { FlowResult } from "./flow.ts";

export type Basins = {
  /** Basin id per cell = the outlet (mouth land cell) it drains to; -1 for ocean. */
  readonly ids: Int32Array;
  /** Cell count per basin, keyed by basin id (which is itself a cell index). */
  readonly sizes: ReadonlyMap<number, number>;
  /** Total land cell count (the denominator for the major-basin gate). */
  readonly landCells: number;
};

/**
 * Drainage basins from the flow field: each land cell is labelled by the outlet
 * it drains to, found by following `flow.dir` downstream until the next step
 * would leave land (a river mouth). That terminal land cell's index is the basin
 * id, so every cell draining to the same mouth shares a basin. Ocean is -1.
 *
 * Pure and deterministic (no RNG); the region charts recompute their own flow, so
 * this works unchanged on windowed sub-grids.
 */
export function computeBasins(elev: Field, flow: FlowResult, seaLevel: number): Basins {
  const { data } = elev;
  const { dir } = flow;
  const n = data.length;
  const isLand = (i: number): boolean => (data[i] as number) > seaLevel;

  const ids = new Int32Array(n).fill(-2); // -2 unresolved, -1 ocean
  for (let i = 0; i < n; i++) if (!isLand(i)) ids[i] = -1;

  // Follow dir to the outlet, memoising the whole path (path compression).
  for (let start = 0; start < n; start++) {
    if (ids[start] !== -2) continue;
    const path: number[] = [];
    let c = start;
    let root: number;
    for (;;) {
      if (ids[c] !== -2) {
        root = ids[c] as number;
        break;
      }
      const d = dir[c] as number;
      if (d < 0 || !isLand(d)) {
        // c is a river mouth (or a landlocked sink): it is its own basin root.
        root = c;
        ids[c] = c;
        break;
      }
      path.push(c);
      c = d;
    }
    for (const p of path) ids[p] = root;
  }

  const sizes = new Map<number, number>();
  let landCells = 0;
  for (let i = 0; i < n; i++) {
    const b = ids[i] as number;
    if (b < 0) continue;
    landCells++;
    sizes.set(b, (sizes.get(b) ?? 0) + 1);
  }
  return { ids, sizes, landCells };
}

/**
 * Watershed divide cells: a land cell in a MAJOR basin whose 4-neighbour drains to
 * a DIFFERENT major basin. A basin is major when it holds at least `frac` of the
 * land. The gate matters: a real 320x240 island has thousands of tiny coastal
 * basins, so without it every ridge reads as a divide. Requiring both sides major
 * keeps only the divides between substantial drainages (continental-divide-like).
 */
export function watershedDivides(basins: Basins, w: number, h: number, frac: number): Uint8Array {
  const { ids, sizes, landCells } = basins;
  const out = new Uint8Array(w * h);
  if (landCells === 0) return out;
  const threshold = frac * landCells;
  const major = new Set<number>();
  for (const [id, size] of sizes) if (size >= threshold) major.add(id);
  if (major.size < 2) return out; // need at least two major basins to have a divide

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      const b = ids[i] as number;
      if (b < 0 || !major.has(b)) continue;
      for (const [dx, dy] of NEIGHBORS_4) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const b2 = ids[nx + ny * w] as number;
        if (b2 >= 0 && b2 !== b && major.has(b2)) {
          out[i] = 1;
          break;
        }
      }
    }
  }
  return out;
}
