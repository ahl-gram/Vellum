import { NEIGHBORS_4, type Field } from "../core/grid.ts";
import type { Settlement } from "./sites.ts";

/** Reads a frozen snapshot of the post-flood labels, so attachment order can never chain an islet onto an already-attached islet; the flood must stay a true FIFO BFS to reach the NEAREST realm by sea (the DFS-stack floods elsewhere would not). */
export function attachSeatlessLandmasses(
  labels: Int16Array,
  landmassIds: Int32Array,
  landmassCount: number,
  elev: Field,
  seaLevel: number,
  seats: ReadonlyArray<number>,
  settlements: ReadonlyArray<Settlement>,
): void {
  const { w, h, data } = elev;
  const n = w * h;
  const frozen = Int16Array.from(labels);

  const cellsByLm: number[][] = Array.from({ length: landmassCount }, () => []);
  for (let i = 0; i < n; i++) {
    const lm = landmassIds[i] as number;
    if (lm >= 0) (cellsByLm[lm] as number[]).push(i);
  }

  const isOcean = (i: number): boolean => (data[i] as number) <= seaLevel;
  const queue = new Int32Array(n);
  const visited = new Uint8Array(n);

  for (let lm = 0; lm < landmassCount; lm++) {
    const cells = cellsByLm[lm] as number[];
    if (cells.length === 0) continue;
    if ((frozen[cells[0] as number] as number) >= 0) continue; // seated

    visited.fill(0);
    let head = 0;
    let tail = 0;
    for (const c of cells) {
      const cx = c % w;
      const cy = (c / w) | 0;
      for (const [dx, dy] of NEIGHBORS_4) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (visited[ni] || !isOcean(ni)) continue;
        visited[ni] = 1;
        queue[tail++] = ni;
      }
    }

    let target = -1;
    while (head < tail) {
      const i = queue[head++] as number;
      const ix = i % w;
      const iy = (i / w) | 0;
      let hit = -1;
      for (const [dx, dy] of NEIGHBORS_4) {
        const nx = ix + dx;
        const ny = iy + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const r = frozen[nx + ny * w] as number;
        if (r >= 0 && (hit === -1 || r < hit)) hit = r; // lowest realm id breaks ties
      }
      if (hit >= 0) {
        target = hit;
        break;
      }
      for (const [dx, dy] of NEIGHBORS_4) {
        const nx = ix + dx;
        const ny = iy + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (visited[ni] || !isOcean(ni)) continue;
        visited[ni] = 1;
        queue[tail++] = ni;
      }
    }

    if (target < 0) target = euclideanNearestSeat(cells, seats, settlements, w);
    for (const c of cells) labels[c] = target;
  }
}

function euclideanNearestSeat(
  cells: ReadonlyArray<number>,
  seats: ReadonlyArray<number>,
  settlements: ReadonlyArray<Settlement>,
  w: number,
): number {
  let cx = 0;
  let cy = 0;
  for (const c of cells) {
    cx += c % w;
    cy += (c / w) | 0;
  }
  cx /= cells.length;
  cy /= cells.length;
  let best = 0;
  let bestDist = Infinity;
  seats.forEach((si, realmId) => {
    const s = settlements[si] as Settlement;
    const d = Math.hypot(s.x - cx, s.y - cy);
    if (d < bestDist) {
      bestDist = d;
      best = realmId;
    }
  });
  return best;
}
