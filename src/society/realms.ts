import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";
import { clamp } from "../core/math.ts";
import { slopeField } from "../terrain/slope.ts";
import type { Settlement } from "./sites.ts";

export type RealmsResult = {
  /** Realm id per cell; -1 for ocean. */
  readonly labels: Int16Array;
  /** Settlement index of each realm's seat; index in this array = realm id. */
  readonly seats: ReadonlyArray<number>;
};

const SLOPE_WEIGHT = 6;
const RIVER_WEIGHT = 1.5;
const MIN_SEAT_SPACING = 24;

/**
 * Partition land into realms: terrain-cost Voronoi regions around the
 * capital and the most distant-from-each-other towns. Rivers and ridges
 * cost more to cross, so borders tend to follow natural features.
 */
export type RealmOptions = {
  maxRealms?: number;
};

export function partitionRealms(
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  settlements: ReadonlyArray<Settlement>,
  opts: RealmOptions = {},
): RealmsResult {
  const { w, h, data } = elev;
  const n = w * h;
  const slope = slopeField(elev);

  let landCells = 0;
  for (let i = 0; i < n; i++) {
    if ((data[i] as number) > seaLevel) landCells++;
  }
  // resolution-independent: bigger landmasses host more realms
  const maxRealms =
    opts.maxRealms ?? clamp(Math.round((landCells / n) * 8), 1, 5);

  const capitalIdx = settlements.findIndex((s) => s.kind === "capital");
  const seats: number[] = capitalIdx >= 0 ? [capitalIdx] : [];

  const towns = settlements
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.kind === "town");
  while (seats.length < maxRealms) {
    let best = -1;
    let bestMinDist = MIN_SEAT_SPACING;
    for (const { s, i } of towns) {
      if (seats.includes(i)) continue;
      const minDist = Math.min(
        ...seats.map((si) => {
          const seat = settlements[si] as Settlement;
          return Math.hypot(seat.x - s.x, seat.y - s.y);
        }),
      );
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        best = i;
      }
    }
    if (best === -1) break;
    seats.push(best);
  }

  const labels = new Int16Array(n).fill(-1);
  if (seats.length === 0) return { labels, seats };

  const dist = new Float64Array(n).fill(Infinity);
  const done = new Uint8Array(n);
  const heap = createMinHeap();

  seats.forEach((settlementIdx, realmId) => {
    const s = settlements[settlementIdx] as Settlement;
    const i = s.x + s.y * w;
    dist[i] = 0;
    labels[i] = realmId;
    heap.push(i, 0);
  });

  while (heap.size() > 0) {
    const i = heap.pop();
    if (done[i]) continue;
    done[i] = 1;
    const d = dist[i] as number;
    const x = i % w;
    const y = (i / w) | 0;
    for (const [dx, dy, stepDist] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = nx + ny * w;
      if (done[ni]) continue;
      if ((data[ni] as number) <= seaLevel) continue;
      const step =
        stepDist *
        (1 +
          (slope.data[ni] as number) * SLOPE_WEIGHT +
          (riverCells[ni] === 1 ? RIVER_WEIGHT : 0));
      const nd = d + step;
      if (nd < (dist[ni] as number)) {
        dist[ni] = nd;
        labels[ni] = labels[i] as number;
        heap.push(ni, nd);
      }
    }
  }

  // offshore islets without settlements: claim for the nearest seat
  for (let i = 0; i < n; i++) {
    if (labels[i] !== -1 || (data[i] as number) <= seaLevel) continue;
    const x = i % w;
    const y = (i / w) | 0;
    let best = 0;
    let bestDist = Infinity;
    seats.forEach((settlementIdx, realmId) => {
      const s = settlements[settlementIdx] as Settlement;
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = realmId;
      }
    });
    labels[i] = best;
  }

  return { labels, seats };
}
