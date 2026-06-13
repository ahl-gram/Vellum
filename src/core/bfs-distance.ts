import { NEIGHBORS_8 } from "./grid.ts";

/**
 * Multi-source 8-connected BFS hop distance over a grid.
 * Impassable or unreachable cells stay Infinity.
 */
export function bfsDistance(
  w: number,
  h: number,
  isSource: (x: number, y: number) => boolean,
  opts?: { passable?: (x: number, y: number) => boolean },
): Float64Array {
  const passable = opts?.passable ?? (() => true);
  const dist = new Float64Array(w * h).fill(Infinity);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isSource(x, y) && passable(x, y)) {
        const i = x + y * w;
        dist[i] = 0;
        queue[tail++] = i;
      }
    }
  }

  while (head < tail) {
    const i = queue[head++] as number;
    const x = i % w;
    const y = (i / w) | 0;
    const d = dist[i] as number;
    for (const [dx, dy] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = nx + ny * w;
      if (dist[ni] !== Infinity || !passable(nx, ny)) continue;
      dist[ni] = d + 1;
      queue[tail++] = ni;
    }
  }

  return dist;
}
