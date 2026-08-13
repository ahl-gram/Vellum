import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";

export type FlowResult = {
  readonly fill: Float64Array;
  readonly dir: Int32Array;
  readonly acc: Float64Array;
};

const EPS = 1e-7;

export function computeFlow(
  elev: Field,
  seaLevel: number,
  rain?: Float64Array,
): FlowResult {
  const { w, h, data } = elev;
  const n = w * h;

  const fill = Float64Array.from(data);
  const visited = new Uint8Array(n);
  const heap = createMinHeap();

  let seeded = false;
  for (let i = 0; i < n; i++) {
    if ((data[i] as number) <= seaLevel) {
      visited[i] = 1;
      heap.push(i, fill[i] as number);
      seeded = true;
    }
  }
  if (!seeded) {
    let mi = 0;
    for (let i = 1; i < n; i++) {
      if ((data[i] as number) < (data[mi] as number)) mi = i;
    }
    visited[mi] = 1;
    heap.push(mi, fill[mi] as number);
  }

  while (heap.size() > 0) {
    const i = heap.pop();
    const x = i % w;
    const y = (i / w) | 0;
    for (const [dx, dy] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = nx + ny * w;
      if (visited[ni]) continue;
      visited[ni] = 1;
      fill[ni] = Math.max(data[ni] as number, (fill[i] as number) + EPS);
      heap.push(ni, fill[ni] as number);
    }
  }

  const dir = new Int32Array(n).fill(-1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      if ((data[i] as number) <= seaLevel) continue;
      let best = -1;
      let bestDrop = 0;
      for (const [dx, dy, dist] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        const drop = ((fill[i] as number) - (fill[ni] as number)) / dist;
        if (drop > bestDrop) {
          bestDrop = drop;
          best = ni;
        }
      }
      dir[i] = best;
    }
  }

  const acc = new Float64Array(n);
  const landOrder: number[] = [];
  for (let i = 0; i < n; i++) {
    if ((data[i] as number) > seaLevel) landOrder.push(i);
  }
  landOrder.sort((a, b) => (fill[b] as number) - (fill[a] as number));
  for (const i of landOrder) {
    acc[i] = (acc[i] as number) + (rain ? (rain[i] as number) : 1);
    const d = dir[i] as number;
    if (d >= 0) acc[d] = (acc[d] as number) + (acc[i] as number);
  }

  return { fill, dir, acc };
}
