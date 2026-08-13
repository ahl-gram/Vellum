import { NEIGHBORS_8 } from "./grid.ts";

/** start is enqueued even when impassable (the voyage's sea legs launch from a LAND port). Determinism rests on integer hops, a FIFO frontier, and the fixed NEIGHBORS_8 order; a float-cost Dijkstra would reintroduce cross-engine float ordering. */
export function bfsPath(
  w: number,
  h: number,
  start: number,
  isGoal: (cell: number) => boolean,
  passable: (cell: number) => boolean,
): number[] | null {
  if (isGoal(start)) return [start];

  const n = w * h;
  const prev = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;

  seen[start] = 1;
  queue[tail++] = start;

  while (head < tail) {
    const i = queue[head++] as number;
    const x = i % w;
    const y = (i / w) | 0;
    for (const [dx, dy] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = nx + ny * w;
      if (seen[ni] || !passable(ni)) continue;
      seen[ni] = 1;
      prev[ni] = i;
      if (isGoal(ni)) return reconstruct(prev, start, ni);
      queue[tail++] = ni;
    }
  }
  return null;
}

function reconstruct(prev: Int32Array, start: number, goal: number): number[] {
  const chain: number[] = [];
  let cur = goal;
  while (cur !== -1) {
    chain.push(cur);
    if (cur === start) break;
    cur = prev[cur] as number;
  }
  chain.reverse();
  return chain;
}
