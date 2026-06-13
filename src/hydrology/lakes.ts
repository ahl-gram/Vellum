import type { Field } from "../core/grid.ts";

export type Lake = {
  readonly area: number;
  readonly centroid: { readonly x: number; readonly y: number };
};

/**
 * Inland water: below-sea-level cells not connected to the border sea.
 * (Edge-falloff worlds always carry their ocean to the border, so
 * anything water-locked inland is a lake.)
 */
export function findLakes(
  elev: Field,
  seaLevel: number,
  minCells = 12,
): Lake[] {
  const { w, h, data } = elev;
  const isWater = (i: number): boolean => (data[i] as number) <= seaLevel;
  const seen = new Uint8Array(w * h);

  const flood = (start: number, collect: number[] | null): void => {
    const queue = [start];
    seen[start] = 1;
    while (queue.length > 0) {
      const i = queue.pop() as number;
      if (collect) collect.push(i);
      const x = i % w;
      const y = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (!seen[ni] && isWater(ni)) {
          seen[ni] = 1;
          queue.push(ni);
        }
      }
    }
  };

  // mark all border-connected water as sea
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = x + y * w;
      if (isWater(i) && !seen[i]) flood(i, null);
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = x + y * w;
      if (isWater(i) && !seen[i]) flood(i, null);
    }
  }

  const lakes: Lake[] = [];
  for (let i = 0; i < w * h; i++) {
    if (seen[i] || !isWater(i)) continue;
    const cells: number[] = [];
    flood(i, cells);
    if (cells.length < minCells) continue;
    let sx = 0;
    let sy = 0;
    for (const c of cells) {
      sx += c % w;
      sy += (c / w) | 0;
    }
    lakes.push({
      area: cells.length,
      centroid: { x: sx / cells.length, y: sy / cells.length },
    });
  }

  lakes.sort((a, b) => b.area - a.area);
  return lakes;
}
