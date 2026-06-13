import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";
import { slopeField } from "../terrain/slope.ts";
import type { Settlement } from "./sites.ts";

export type RoadPoint = { readonly x: number; readonly y: number };

export type Road = {
  readonly points: ReadonlyArray<RoadPoint>;
  readonly rank: "trunk" | "lane";
};

const SLOPE_PENALTY = 12;
const RIVER_CROSSING = 4.5;
const REUSE_DISCOUNT = 0.3;
const VILLAGE_BUDGET = 260;

/**
 * Connect settlements with terrain-aware Dijkstra paths. Each new road
 * runs to the NEAREST cell of the existing network, and steps onto
 * existing road cells at a steep discount — so shared trunk corridors
 * emerge instead of a star of independent paths.
 */
export function buildRoads(
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  settlements: ReadonlyArray<Settlement>,
): Road[] {
  const { w, h, data } = elev;
  const n = w * h;
  const slope = slopeField(elev);

  const capital = settlements.find((s) => s.kind === "capital");
  if (!capital) return [];

  const network = new Uint8Array(n);
  network[capital.x + capital.y * w] = 1;

  const terrainCost = (i: number): number =>
    1 +
    (slope.data[i] as number) * SLOPE_PENALTY +
    (riverCells[i] === 1 ? RIVER_CROSSING : 0);

  const roads: Road[] = [];

  const connect = (
    sx: number,
    sy: number,
    rank: Road["rank"],
    budget: number,
  ): void => {
    const start = sx + sy * w;
    if (network[start]) return;

    const dist = new Float64Array(n).fill(Infinity);
    const prev = new Int32Array(n).fill(-1);
    const done = new Uint8Array(n);
    const heap = createMinHeap();
    dist[start] = 0;
    heap.push(start, 0);

    let found = -1;
    while (heap.size() > 0) {
      const i = heap.pop();
      if (done[i]) continue;
      done[i] = 1;
      if (network[i]) {
        found = i;
        break;
      }
      const d = dist[i] as number;
      if (d > budget) break;
      const x = i % w;
      const y = (i / w) | 0;
      for (const [dx, dy, stepDist] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (done[ni]) continue;
        if ((data[ni] as number) <= seaLevel) continue;
        let step = stepDist * terrainCost(ni);
        if (network[ni]) step *= REUSE_DISCOUNT;
        const nd = d + step;
        if (nd < (dist[ni] as number)) {
          dist[ni] = nd;
          prev[ni] = i;
          heap.push(ni, nd);
        }
      }
    }
    if (found === -1) return; // unreachable (another island) — no road

    const points: RoadPoint[] = [];
    let cur = found;
    while (cur !== -1) {
      points.push({ x: cur % w, y: (cur / w) | 0 });
      cur = prev[cur] as number;
    }
    // points run found → start; orient start → network for readability
    points.reverse();
    for (const p of points) network[p.x + p.y * w] = 1;
    roads.push({ points, rank });
  };

  const capDist = (s: Settlement): number =>
    Math.hypot(s.x - capital.x, s.y - capital.y);

  const towns = settlements
    .filter((s) => s.kind === "town")
    .sort((a, b) => capDist(a) - capDist(b));
  for (const t of towns) connect(t.x, t.y, "trunk", Infinity);

  const villages = settlements
    .filter((s) => s.kind === "village")
    .sort((a, b) => capDist(a) - capDist(b));
  for (const v of villages) connect(v.x, v.y, "lane", VILLAGE_BUDGET);

  return roads;
}
