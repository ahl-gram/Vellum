import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";
import { clamp } from "../core/math.ts";
import { slopeField } from "../terrain/slope.ts";
import { labelLandmasses } from "../world/landmass.ts";
import { computeBasins, watershedDivides } from "../hydrology/basins.ts";
import { isMajorRiver, type River } from "../hydrology/rivers.ts";
import type { FlowResult } from "../hydrology/flow.ts";
import { attachSeatlessLandmasses } from "./sea-route.ts";
import { snapBordersToFeatures } from "./border-snap.ts";
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

// #79 per-landmass realm budget: the pre-#79 world formula
// `clamp(round((landCells/n)*8), 1, 5)`, now scoped to each landmass. Realm count
// is a property of the fictional world (its grid FRACTION), so it stays
// resolution-independent across the 320x240 production grid and the smaller grids
// the unit/render tests use, rather than tracking pixel count.
const REALM_LAND_DIVISOR = 8;
const MAX_REALMS_PER_LANDMASS = 5;
// A landmass below this fraction of the grid (~0.4%, about 300 cells at 320x240)
// attaches to a neighbour by sea route even when settled (size wins): only a
// substantial island governs itself.
const SUBSTANTIAL_FRACTION = 0.004;
// Overall realm ceiling per world; an over-ceiling archipelago attaches its
// smallest islands to neighbours instead of minting more realms.
const GENERATION_CEILING = 8;

// #80 border snapping. Rivers run in valleys and divides on ridges lie within a
// couple of cells of the cost-bisector where they run alongside it; a border only
// snaps to a feature inside this many cells of it, so featureless stretches stay
// straight. A basin must hold at least MAJOR_BASIN_FRACTION of the land to seed a
// divide, or the thousands of coastal micro-basins would make every ridge one.
const CORRIDOR_RADIUS = 6;
const MAJOR_BASIN_FRACTION = 0.03;

/**
 * Partition land into realms. Open water is a hard frontier: connected landmasses
 * (from labelLandmasses) each host their own realms, the terrain-cost flood never
 * crosses to another landmass, and a substantial inhabited island is its own
 * realm. Small or empty islands attach to the nearest realm by sea route. Rivers
 * and ridges cost more to cross, so internal borders follow natural features.
 */
export type RealmOptions = {
  /** Overall realm ceiling for the world (e.g. 1 for a city-state). */
  maxRealms?: number;
  /**
   * When present, snap internal borders onto major rivers and watershed divides
   * (#80). Omitted by the unit tests, so their partitions stay feature-agnostic;
   * generate.ts and region.ts pass it to activate the snap.
   */
  snap?: { readonly rivers: ReadonlyArray<River>; readonly flow: FlowResult };
  /**
   * Major-river cells the realm flood may claim but never cross (#140). Where two
   * realms grow toward each other across a major river they meet on it, so the
   * river becomes their frontier. Opt-in, so unit-test partitions stay
   * feature-agnostic; generate.ts builds it from rivers.filter(isMajorRiver).
   */
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
  if (opts.snap) {
    const seatCells = seats.map((si) => {
      const s = settlements[si] as Settlement;
      return s.x + s.y * w;
    });
    snapRealmBorders(labels, elev, seaLevel, landmassIds, seatCells, opts.snap);
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

/**
 * Build the feature mask (major rivers united with major watershed divides) and
 * snap the freshly flooded partition onto it. Runs after floodRealms and before
 * the sea-route attach: the mainland borders exist by now, and seatless islands
 * (still -1) carry no internal border, so border-snap correctly ignores them.
 */
function snapRealmBorders(
  labels: Int16Array,
  elev: Field,
  seaLevel: number,
  landmassIds: Int32Array,
  seatCells: ReadonlyArray<number>,
  snap: { readonly rivers: ReadonlyArray<River>; readonly flow: FlowResult },
): void {
  const { w, h } = elev;
  const featureMask = new Uint8Array(w * h);
  for (const r of snap.rivers) {
    if (!isMajorRiver(r)) continue;
    for (const p of r.points) {
      const i = p.x + p.y * w;
      if ((labels[i] as number) >= 0) featureMask[i] = 1; // land cells of the river
    }
  }
  const basins = computeBasins(elev, snap.flow, seaLevel);
  const divides = watershedDivides(basins, w, h, MAJOR_BASIN_FRACTION);
  for (let i = 0; i < featureMask.length; i++) if (divides[i]) featureMask[i] = 1;

  snapBordersToFeatures(labels, w, h, landmassIds, featureMask, CORRIDOR_RADIUS, seatCells);
}

/**
 * Choose one seat per realm: the capital seats realm 0 and its landmass always
 * governs itself; every other substantial, inhabited landmass adds realms up to
 * its own area budget, largest first, until the world ceiling is reached.
 */
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
      // Inhabited but seatless: promote its top settlement (a village) so the
      // seats-indexed model still holds.
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

/**
 * Greedy farthest-point selection over the towns of one landmass, seeded with the
 * seats already fixed on it. This is the pre-#79 global seat loop scoped to a
 * single landmass; with every town on the mainland it reproduces the old
 * selection exactly.
 */
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

/** Highest-desirability settlement on a landmass; ties break by position (x, y). */
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

/**
 * Terrain-cost Voronoi flood from the seats, confined to land and to a single
 * landmass: the 8-connected step is blocked both at the sea (`<= seaLevel`) and at
 * any diagonal corner where the neighbour belongs to a different landmass, so a
 * realm never bleeds across open water.
 */
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
    // #140 barrier: a major-river cell is claimable but never propagates (a
    // membrane), so two realms meet on it -- except a seat, which must always
    // flood its own realm even when the river runs through its cell.
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
      // #140: a diagonal step must not slip between two diagonally-adjacent barrier
      // cells, or the flood would leak across a diagonal river.
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

/**
 * A major-river barrier can strand land reachable only across a river (e.g. two
 * rivers seal a landmass coast-to-coast, isolating a seatless half). Assign every
 * such cell so no land is left unassigned: re-run the flood WITHOUT the barrier and
 * adopt its label only where the barrier flood left -1. The annexing realm simply
 * owns both banks there (the river is interior, not a frontier, where one realm
 * holds both sides). Deterministic; the second flood is skipped unless a barrier
 * actually walled off part of a SEATED landmass -- seatless islands, which are -1
 * here too, are left for attachSeatlessLandmasses.
 */
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
  // Genuine stranding is only on a SEATED landmass: a seatless island is -1 here too,
  // but the barrier-free reflood (also landmass-confined) leaves it -1, so it is not
  // stranded -- excluding it keeps the second flood from running on nearly every world.
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
  // Re-flood with no barrier: this assigns every seated-landmass cell, so adopting
  // its label wherever the barrier flood left -1 fills the stranded region without
  // disturbing any cell the barrier already placed. Seatless landmasses stay -1 for
  // attachSeatlessLandmasses to handle.
  const full = new Int16Array(n).fill(-1);
  floodRealms(full, elev, seaLevel, slope, riverCells, landmassIds, settlements, seats);
  for (let i = 0; i < n; i++) {
    if ((labels[i] as number) < 0 && (full[i] as number) >= 0) labels[i] = full[i] as number;
  }
}
