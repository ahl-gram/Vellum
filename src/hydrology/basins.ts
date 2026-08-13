import { NEIGHBORS_4, type Field } from "../core/grid.ts";
import type { FlowResult } from "./flow.ts";

export type Basins = {
  readonly ids: Int32Array;
  readonly sizes: ReadonlyMap<number, number>;
  readonly landCells: number;
};

export function computeBasins(elev: Field, flow: FlowResult, seaLevel: number): Basins {
  const { data } = elev;
  const { dir } = flow;
  const n = data.length;
  const isLand = (i: number): boolean => (data[i] as number) > seaLevel;

  const ids = new Int32Array(n).fill(-2); // -2 unresolved, -1 ocean
  for (let i = 0; i < n; i++) if (!isLand(i)) ids[i] = -1;

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
