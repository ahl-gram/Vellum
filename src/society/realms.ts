import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";
import { clamp } from "../core/math.ts";
import { slopeField } from "../terrain/slope.ts";
import { labelLandmasses } from "../world/landmass.ts";
import { attachSeatlessLandmasses } from "./sea-route.ts";
import type { Settlement } from "./sites.ts";

export type RealmsResult = {
  readonly labels: Int16Array;
  readonly seats: ReadonlyArray<number>;
};

const SLOPE_WEIGHT = 6;
const RIVER_WEIGHT = 1.5;
const MIN_SEAT_SPACING = 24;

// Realm budget scales with the grid FRACTION, so counts stay resolution-independent across production and test grids.
const REALM_LAND_DIVISOR = 8;
const MAX_REALMS_PER_LANDMASS = 5;
const SUBSTANTIAL_FRACTION = 0.004;
const GENERATION_CEILING = 8;

export type RealmOptions = {
  maxRealms?: number;
  barrier?: Uint8Array;
};

export function partitionRealms(
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  settlements: ReadonlyArray<Settlement>,
  opts: RealmOptions = {},
): RealmsResult {
  const { w, h } = elev;
  const n = w * h;
  const slope = slopeField(elev);
  const { ids: landmassIds, sizes } = labelLandmasses(elev, seaLevel);
  const lmOf = (s: Settlement): number => landmassIds[s.x + s.y * w] as number;

  const seats = selectSeats(settlements, sizes, n, lmOf, opts);

  if (seats.length === 0) return { labels: new Int16Array(n).fill(-1), seats };

  const flooded = floodRealms(elev, seaLevel, slope, riverCells, landmassIds, settlements, seats, opts.barrier);
  const bridged = opts.barrier
    ? fillBarrierStrandedLand(flooded, elev, seaLevel, slope, riverCells, landmassIds, settlements, seats)
    : flooded;
  const labels = attachSeatlessLandmasses(bridged, landmassIds, sizes.length, elev, seaLevel, seats, settlements);

  return { labels, seats };
}

function landmassBudget(sizes: ReadonlyArray<number>, n: number, lm: number): number {
  return clamp(Math.round(((sizes[lm] as number) / n) * REALM_LAND_DIVISOR), 1, MAX_REALMS_PER_LANDMASS);
}

function realmBearingLandmasses(
  settlements: ReadonlyArray<Settlement>,
  sizes: ReadonlyArray<number>,
  n: number,
  lmOf: (s: Settlement) => number,
  capitalLm: number,
): number[] {
  const substantialArea = SUBSTANTIAL_FRACTION * n;
  const hasSettlement = new Uint8Array(sizes.length);
  for (const s of settlements) {
    const lm = lmOf(s);
    if (lm >= 0) hasSettlement[lm] = 1;
  }
  const realmBearing: number[] = [];
  for (let lm = 0; lm < sizes.length; lm++) {
    if (lm === capitalLm) continue;
    if ((sizes[lm] as number) >= substantialArea && hasSettlement[lm]) realmBearing.push(lm);
  }
  realmBearing.sort((a, b) => (sizes[b] as number) - (sizes[a] as number) || a - b);
  return realmBearing;
}

function landmassSeatPicks(
  settlements: ReadonlyArray<Settlement>,
  lmOf: (s: Settlement) => number,
  lm: number,
  budget: number,
): number[] {
  const picks = pickTownSeats(settlements, lmOf, lm, budget, []);
  if (picks.length === 0) {
    const top = topSettlementOnLandmass(settlements, lmOf, lm);
    if (top >= 0) return [top];
  }
  return picks;
}

function selectSeats(
  settlements: ReadonlyArray<Settlement>,
  sizes: ReadonlyArray<number>,
  n: number,
  lmOf: (s: Settlement) => number,
  opts: RealmOptions,
): number[] {
  const overallCap = opts.maxRealms ?? GENERATION_CEILING;

  const capitalIdx = settlements.findIndex((s) => s.kind === "capital");
  const capitalLm = capitalIdx >= 0 ? lmOf(settlements[capitalIdx] as Settlement) : -1;
  const seats: number[] = [];

  if (capitalIdx >= 0) {
    seats.push(capitalIdx); // realm 0
    const budget = Math.min(landmassBudget(sizes, n, capitalLm), overallCap);
    for (const idx of pickTownSeats(settlements, lmOf, capitalLm, budget, [capitalIdx])) {
      if (!seats.includes(idx)) seats.push(idx);
    }
  }

  for (const lm of realmBearingLandmasses(settlements, sizes, n, lmOf, capitalLm)) {
    if (seats.length >= overallCap) break;
    const budget = Math.min(landmassBudget(sizes, n, lm), overallCap - seats.length);
    for (const idx of landmassSeatPicks(settlements, lmOf, lm, budget)) {
      if (seats.length >= overallCap) break;
      if (!seats.includes(idx)) seats.push(idx);
    }
  }

  return seats;
}

function pickTownSeats(
  settlements: ReadonlyArray<Settlement>,
  lmOf: (s: Settlement) => number,
  lm: number,
  budget: number,
  seeded: ReadonlyArray<number>,
): number[] {
  const towns = settlements.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "town" && lmOf(s) === lm);
  const chosen = [...seeded];
  while (chosen.length < budget) {
    let best = -1;
    let bestMinDist = MIN_SEAT_SPACING;
    for (const { s, i } of towns) {
      if (chosen.includes(i)) continue;
      const minDist = Math.min(
        ...chosen.map((si) => {
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
    chosen.push(best);
  }
  return chosen;
}

function topSettlementOnLandmass(
  settlements: ReadonlyArray<Settlement>,
  lmOf: (s: Settlement) => number,
  lm: number,
): number {
  let best = -1;
  let bestScore = -Infinity;
  let bestX = Infinity;
  let bestY = Infinity;
  settlements.forEach((s, i) => {
    if (lmOf(s) !== lm) return;
    if (s.score > bestScore || (s.score === bestScore && (s.x < bestX || (s.x === bestX && s.y < bestY)))) {
      best = i;
      bestScore = s.score;
      bestX = s.x;
      bestY = s.y;
    }
  });
  return best;
}

function realmSeeds(
  n: number,
  w: number,
  settlements: ReadonlyArray<Settlement>,
  seats: ReadonlyArray<number>,
): { labels: Int16Array; dist: Float64Array; isSeatCell: Uint8Array; cells: number[] } {
  const labels = new Int16Array(n).fill(-1);
  const dist = new Float64Array(n).fill(Infinity);
  const isSeatCell = new Uint8Array(n);
  const cells: number[] = [];
  seats.forEach((settlementIdx, realmId) => {
    const s = settlements[settlementIdx] as Settlement;
    const i = s.x + s.y * w;
    dist[i] = 0;
    labels[i] = realmId;
    isSeatCell[i] = 1;
    cells.push(i);
  });
  return { labels, dist, isSeatCell, cells };
}

function cutsBarrierCorner(
  barrier: Uint8Array | undefined,
  x: number,
  y: number,
  dx: number,
  dy: number,
  w: number,
): boolean {
  return (
    barrier !== undefined && dx !== 0 && dy !== 0 && barrier[x + dx + y * w] === 1 && barrier[x + (y + dy) * w] === 1
  );
}

function realmStepCost(stepDist: number, slope: Field, riverCells: Uint8Array, ni: number): number {
  return stepDist * (1 + (slope.data[ni] as number) * SLOPE_WEIGHT + (riverCells[ni] === 1 ? RIVER_WEIGHT : 0));
}

function floodRealms(
  elev: Field,
  seaLevel: number,
  slope: Field,
  riverCells: Uint8Array,
  landmassIds: Int32Array,
  settlements: ReadonlyArray<Settlement>,
  seats: ReadonlyArray<number>,
  barrier?: Uint8Array,
): Int16Array {
  const { w, h, data } = elev;
  const n = w * h;
  const { labels, dist, isSeatCell, cells } = realmSeeds(n, w, settlements, seats);
  const done = new Uint8Array(n);
  const heap = createMinHeap();
  for (const i of cells) heap.push(i, 0);

  while (heap.size() > 0) {
    const i = heap.pop();
    if (done[i]) continue;
    done[i] = 1;
    if (barrier !== undefined && barrier[i] === 1 && isSeatCell[i] === 0) continue;
    const d = dist[i] as number;
    const x = i % w;
    const y = (i / w) | 0;
    const lm = landmassIds[i] as number;
    for (const [dx, dy, stepDist] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = nx + ny * w;
      if (done[ni]) continue;
      if ((data[ni] as number) <= seaLevel) continue;
      if ((landmassIds[ni] as number) !== lm) continue;
      if (cutsBarrierCorner(barrier, x, y, dx, dy, w)) continue;
      const nd = d + realmStepCost(stepDist, slope, riverCells, ni);
      if (nd < (dist[ni] as number)) {
        dist[ni] = nd;
        labels[ni] = labels[i] as number;
        heap.push(ni, nd);
      }
    }
  }
  return labels;
}

function fillBarrierStrandedLand(
  flooded: Int16Array,
  elev: Field,
  seaLevel: number,
  slope: Field,
  riverCells: Uint8Array,
  landmassIds: Int32Array,
  settlements: ReadonlyArray<Settlement>,
  seats: ReadonlyArray<number>,
): Int16Array {
  const { w, h, data } = elev;
  const n = w * h;
  const seatedLm = new Set<number>();
  for (const si of seats) {
    const s = settlements[si] as Settlement;
    seatedLm.add(landmassIds[s.x + s.y * w] as number);
  }
  let stranded = false;
  for (let i = 0; i < n; i++) {
    if ((data[i] as number) > seaLevel && (flooded[i] as number) < 0 && seatedLm.has(landmassIds[i] as number)) {
      stranded = true;
      break;
    }
  }
  if (!stranded) return flooded;
  const full = floodRealms(elev, seaLevel, slope, riverCells, landmassIds, settlements, seats);
  const labels = Int16Array.from(flooded);
  for (let i = 0; i < n; i++) {
    if ((labels[i] as number) < 0 && (full[i] as number) >= 0) labels[i] = full[i] as number;
  }
  return labels;
}
