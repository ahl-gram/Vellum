import { NEIGHBORS_8 } from "./grid.ts";

/**
 * Single-source, single-target 8-connected BFS over a grid, reconstructing the
 * cell chain through first-discovery predecessors. Returns the chain from `start`
 * to the nearest cell satisfying `isGoal` (inclusive), or null when none is
 * reachable across `passable` cells.
 *
 * A sibling of bfs-distance.ts rather than an extension of it: `bfsDistance` is a
 * multi-source distance FIELD with no predecessors, and world generation calls it
 * on every draw (generate.ts builds `oceanDist` with it). Bolting a predecessor
 * array onto that would allocate a second w*h array per world for callers that
 * never read it. Different contract, different function.
 *
 * `start` is enqueued whether or not it is passable, because the voyage's sea legs
 * launch from a LAND port under a sea-only passability test. A goal cell, by
 * contrast, is only ever discovered through `passable`, so an impassable goal is
 * reachable only when it IS the start.
 *
 * INVARIANT: determinism rests on there being no float compare here. Hops are
 * integers, the frontier is FIFO, and NEIGHBORS_8 is a fixed order, so every cell
 * is discovered from exactly one predecessor and identical inputs reconstruct an
 * identical chain. Swapping this for a cost-weighted Dijkstra (diagonals at
 * Math.SQRT2) would reintroduce exactly the float ordering the project forbids
 * relying on across engines.
 */
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
      // Checked on discovery, so the FIRST goal found is the fewest-hops one.
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
