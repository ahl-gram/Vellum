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

  const labels = new Int16Array(n).fill(-1);
  if (seats.length === 0) return { labels, seats };

  floodRealms(labels, elev, seaLevel, slope, riverCells, landmassIds, settlements, seats, opts.barrier);
  if (opts.barrier) {
    fillBarrierStrandedLand(labels, elev, seaLevel, slope, riverCells, landmassIds, settlements, seats);
  }
  attachSeatlessLandmasses(
    labels,
    landmassIds,
    sizes.length,
    elev,
    seaLevel,
    seats,
    settlements,
  );

  return { labels, seats };
}

function selectSeats(
  settlements: ReadonlyArray<Settlement>,
  sizes: ReadonlyArray<number>,
  n: number,
  lmOf: (s: Settlement) => number,
  opts: RealmOptions,
): number[] {
  const overallCap = opts.maxRealms ?? GENERATION_CEILING;
  const budgetOf = (lm: number): number =>
    clamp(
      Math.round(((sizes[lm] as number) / n) * REALM_LAND_DIVISOR),
      1,
      MAX_REALMS_PER_LANDMASS,
    );
  const substantialArea = SUBSTANTIAL_FRACTION * n;

  const capitalIdx = settlements.findIndex((s) => s.kind === "capital");
  const capitalLm = capitalIdx >= 0 ? lmOf(settlements[capitalIdx] as Settlement) : -1;
  const seats: number[] = [];

  if (capitalIdx >= 0) {
    seats.push(capitalIdx); // realm 0
    const budget = Math.min(budgetOf(capitalLm), overallCap);
    for (const idx of pickTownSeats(settlements, lmOf, capitalLm, budget, [capitalIdx])) {
      if (!seats.includes(idx)) seats.push(idx);
    }
  }

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

  for (const lm of realmBearing) {
    if (seats.length >= overallCap) break;
    const budget = Math.min(budgetOf(lm), overallCap - seats.length);
    let picks = pickTownSeats(settlements, lmOf, lm, budget, []);
    if (picks.length === 0) {
      const top = topSettlementOnLandmass(settlements, lmOf, lm);
      if (top >= 0) picks = [top];
    }
    for (const idx of picks) {
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
  const towns = settlements
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.kind === "town" && lmOf(s) === lm);
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
    if (
      s.score > bestScore ||
      (s.score === bestScore && (s.x < bestX || (s.x === bestX && s.y < bestY)))
    ) {
      best = i;
      bestScore = s.score;
      bestX = s.x;
      bestY = s.y;
    }
  });
  return best;
}

function floodRealms(
  labels: Int16Array,
  elev: Field,
  seaLevel: number,
  slope: Field,
  riverCells: Uint8Array,
  landmassIds: Int32Array,
  settlements: ReadonlyArray<Settlement>,
  seats: ReadonlyArray<number>,
  barrier?: Uint8Array,
): void {
  const { w, h, data } = elev;
  const n = w * h;
  const dist = new Float64Array(n).fill(Infinity);
  const done = new Uint8Array(n);
  const heap = createMinHeap();

  const isSeatCell = new Uint8Array(n);
  seats.forEach((settlementIdx, realmId) => {
    const s = settlements[settlementIdx] as Settlement;
    const i = s.x + s.y * w;
    dist[i] = 0;
    labels[i] = realmId;
    isSeatCell[i] = 1;
    heap.push(i, 0);
  });

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
      if (
        barrier !== undefined &&
        dx !== 0 &&
        dy !== 0 &&
        barrier[x + dx + y * w] === 1 &&
        barrier[x + (y + dy) * w] === 1
      )
        continue;
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
}

function fillBarrierStrandedLand(
  labels: Int16Array,
  elev: Field,
  seaLevel: number,
  slope: Field,
  riverCells: Uint8Array,
  landmassIds: Int32Array,
  settlements: ReadonlyArray<Settlement>,
  seats: ReadonlyArray<number>,
): void {
  const { w, h, data } = elev;
  const n = w * h;
  const seatedLm = new Set<number>();
  for (const si of seats) {
    const s = settlements[si] as Settlement;
    seatedLm.add(landmassIds[s.x + s.y * w] as number);
  }
  let stranded = false;
  for (let i = 0; i < n; i++) {
    if (
      (data[i] as number) > seaLevel &&
      (labels[i] as number) < 0 &&
      seatedLm.has(landmassIds[i] as number)
    ) {
      stranded = true;
      break;
    }
  }
  if (!stranded) return;
  const full = new Int16Array(n).fill(-1);
  floodRealms(full, elev, seaLevel, slope, riverCells, landmassIds, settlements, seats);
  for (let i = 0; i < n; i++) {
    if ((labels[i] as number) < 0 && (full[i] as number) >= 0) labels[i] = full[i] as number;
  }
}
