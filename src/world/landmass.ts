import type { Field } from "../core/grid.ts";

export type LandmassLabels = {
  /**
   * Landmass id per cell in first-seen row-major order; -1 for ocean. Int32 so
   * an id (magnitude bounded by the cell count) can never overflow or collide
   * with the -1 sentinel: a 320x240 world has 76800 cells, well past Int16.
   */
  readonly ids: Int32Array;
  /** Cell count of landmass k, indexed by id. `sizes.length` is the count. */
  readonly sizes: ReadonlyArray<number>;
};

/**
 * Label every land cell (elev > seaLevel) with the id of the connected landmass
 * it belongs to; ocean cells (elev <= seaLevel) are -1. Ids are assigned in
 * first-seen row-major order, so the labeling is a pure, deterministic function
 * of the heightfield with no rng.
 *
 * Connectivity is 4-connected (N/S/E/W): cells touching only at a corner are
 * separate landmasses, matching how the coastline renders. This mirrors the
 * flood in render/blobs.ts rather than reusing it, keeping the world layer free
 * of a render dependency.
 */
export function labelLandmasses(elev: Field, seaLevel: number): LandmassLabels {
  const { w, h, data } = elev;
  const n = w * h;
  const ids = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  const isLand = (i: number): boolean => (data[i] as number) > seaLevel;

  for (let start = 0; start < n; start++) {
    if (ids[start] !== -1 || !isLand(start)) continue;
    const id = sizes.length;
    let count = 0;
    const stack = [start];
    ids[start] = id;
    while (stack.length > 0) {
      const i = stack.pop() as number;
      count++;
      const gx = i % w;
      const gy = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (ids[ni] === -1 && isLand(ni)) {
          ids[ni] = id;
          stack.push(ni);
        }
      }
    }
    sizes.push(count);
  }

  return { ids, sizes };
}
