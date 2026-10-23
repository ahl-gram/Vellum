import { NEIGHBORS_4, NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";
import { SLOPE_WEIGHT, RIVER_WEIGHT } from "../society/realms.ts";
import { slopeField } from "../terrain/slope.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { grownRealmLabels } from "./realm-carry.ts";
import { cellsPerWorldCell, nearestParentCells } from "./region-parent.ts";
import type { World } from "./types.ts";

export type RealmTown = { readonly x: number; readonly y: number; readonly realm: number };

export type RefineInput = {
  readonly grownParent: Int16Array;
  readonly parentLand: Uint8Array;
  readonly parentW: number;
  readonly parentH: number;
  readonly parentOf: Int32Array;
  readonly elev: Field;
  readonly seaLevel: number;
  readonly riverCells: Uint8Array;
  readonly cellsPerWorldCell: number;
  readonly towns: ReadonlyArray<RealmTown>;
};

function contestedParentCells(grownParent: Int16Array, parentW: number, parentH: number): Uint8Array {
  const contested = new Uint8Array(parentW * parentH);
  for (let y = 0; y < parentH; y++) {
    for (let x = 0; x < parentW; x++) {
      const a = grownParent[x + y * parentW] as number;
      if (a < 0) continue;
      for (const offset of NEIGHBORS_8) {
        const nx = x + offset[0];
        const ny = y + offset[1];
        if (nx < 0 || nx >= parentW || ny < 0 || ny >= parentH) continue;
        const b = grownParent[nx + ny * parentW] as number;
        if (b >= 0 && b !== a) contested[x + y * parentW] = 1;
      }
    }
  }
  return contested;
}

function seedLabels(input: RefineInput, contested: Uint8Array): { labels: Int16Array; corridor: Uint8Array } {
  const { grownParent, parentOf, elev, seaLevel } = input;
  const labels = new Int16Array(elev.data.length).fill(-1);
  const corridor = new Uint8Array(elev.data.length);
  for (let i = 0; i < labels.length; i++) {
    if ((elev.data[i] as number) <= seaLevel) continue;
    const p = parentOf[i] as number;
    labels[i] = grownParent[p] as number;
    if (contested[p] === 1) corridor[i] = 1;
  }
  return { labels, corridor };
}

function touchesCorridor(corridor: Uint8Array, w: number, h: number, i: number): boolean {
  const x = i % w;
  const y = (i / w) | 0;
  for (const offset of NEIGHBORS_8) {
    const nx = x + offset[0];
    const ny = y + offset[1];
    if (nx >= 0 && nx < w && ny >= 0 && ny < h && corridor[nx + ny * w] === 1) return true;
  }
  return false;
}

function travelPenalty(input: RefineInput, slope: Field, j: number): number {
  const cpw = input.cellsPerWorldCell;
  return (slope.data[j] as number) * cpw * SLOPE_WEIGHT + (input.riverCells[j] === 1 ? RIVER_WEIGHT * cpw : 0);
}

function refloodCorridor(input: RefineInput, seeded: { labels: Int16Array; corridor: Uint8Array }): Int16Array {
  const { elev, seaLevel, towns } = input;
  const { w, h, data } = elev;
  const { corridor } = seeded;
  const labels = Int16Array.from(seeded.labels);
  const n = w * h;
  const isLand = (i: number): boolean => (data[i] as number) > seaLevel;
  const slope = slopeField(elev);
  const dist = new Float64Array(n).fill(Infinity);
  const fixed = new Uint8Array(n);
  const done = new Uint8Array(n);
  const heap = createMinHeap();
  for (const t of towns) {
    const i = t.x + t.y * w;
    if (!isLand(i) || t.realm < 0) continue;
    labels[i] = t.realm;
    fixed[i] = 1;
    dist[i] = 0;
    heap.push(i, 0);
  }
  for (let i = 0; i < n; i++) {
    if (!isLand(i) || corridor[i] === 1 || fixed[i] === 1 || (labels[i] as number) < 0) continue;
    if (!touchesCorridor(corridor, w, h, i)) continue;
    dist[i] = 0;
    heap.push(i, 0);
  }
  while (heap.size() > 0) {
    const i = heap.pop();
    if (done[i] === 1) continue;
    done[i] = 1;
    const x = i % w;
    const y = (i / w) | 0;
    for (const offset of NEIGHBORS_8) {
      const nx = x + offset[0];
      const ny = y + offset[1];
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const j = nx + ny * w;
      if (done[j] === 1 || fixed[j] === 1 || corridor[j] === 0 || !isLand(j)) continue;
      const cost = offset[2] * (1 + travelPenalty(input, slope, j));
      const nd = (dist[i] as number) + cost;
      if (nd < (dist[j] as number)) {
        dist[j] = nd;
        labels[j] = labels[i] as number;
        heap.push(j, nd);
      }
    }
  }
  return labels;
}

function mostFrequentLabel(labels: Int16Array, cells: ReadonlyArray<number>): number {
  const votes = new Map<number, number>();
  for (const i of cells) {
    const l = labels[i] as number;
    if (l >= 0) votes.set(l, (votes.get(l) ?? 0) + 1);
  }
  let best = -1;
  let bestN = 0;
  for (const [l, c] of [...votes].sort((a, b) => a[0] - b[0])) {
    if (c > bestN) {
      best = l;
      bestN = c;
    }
  }
  return best;
}

function wholeIslets(
  labels: Int16Array,
  isLand: (i: number) => boolean,
  onParentLand: (i: number) => boolean,
  w: number,
  h: number,
): Int16Array {
  const out = Int16Array.from(labels);
  const seen = new Uint8Array(w * h);
  for (let s = 0; s < seen.length; s++) {
    if (seen[s] === 1 || !isLand(s)) continue;
    const comp = [s];
    seen[s] = 1;
    let anchored = false;
    for (let k = 0; k < comp.length; k++) {
      const i = comp[k] as number;
      if (onParentLand(i)) anchored = true;
      const x = i % w;
      const y = (i / w) | 0;
      for (const offset of NEIGHBORS_4) {
        const nx = x + offset[0];
        const ny = y + offset[1];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const j = nx + ny * w;
        if (seen[j] === 1 || !isLand(j)) continue;
        seen[j] = 1;
        comp.push(j);
      }
    }
    if (anchored) continue;
    const label = mostFrequentLabel(labels, comp);
    for (const i of comp) out[i] = label;
  }
  return out;
}

export function refineRealmLabels(input: RefineInput): Int16Array {
  const { grownParent, parentLand, parentW, parentH, parentOf, elev, seaLevel } = input;
  const seeded = seedLabels(input, contestedParentCells(grownParent, parentW, parentH));
  const reflooded = refloodCorridor(input, seeded);
  return wholeIslets(
    reflooded,
    (i) => (elev.data[i] as number) > seaLevel,
    (i) => parentLand[parentOf[i] as number] === 1,
    elev.w,
    elev.h,
  );
}

type RefineLand = { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array };

export function refineRegionRealms(
  world: World,
  window: UvWindow,
  land: RefineLand,
  towns: ReadonlyArray<RealmTown>,
): Int16Array {
  const { recipe } = world;
  const parentLand = new Uint8Array(world.elev.data.length);
  for (let p = 0; p < parentLand.length; p++) parentLand[p] = (world.elev.data[p] as number) > world.seaLevel ? 1 : 0;
  return refineRealmLabels({
    grownParent: grownRealmLabels(world),
    parentLand,
    parentW: recipe.gridW,
    parentH: recipe.gridH,
    parentOf: nearestParentCells(recipe.gridW, recipe.gridH, window, land.elev.w, land.elev.h),
    elev: land.elev,
    seaLevel: land.seaLevel,
    riverCells: land.riverCells,
    cellsPerWorldCell: cellsPerWorldCell(land.elev.w, window, recipe.gridW),
    towns,
  });
}

export function realmOwners(
  world: World,
  window: UvWindow,
  land: { readonly elev: Field; readonly seaLevel: number },
  labels: Int16Array,
): Int16Array {
  const { recipe } = world;
  const grown = grownRealmLabels(world);
  const parentOf = nearestParentCells(recipe.gridW, recipe.gridH, window, land.elev.w, land.elev.h);
  const owner = new Int16Array(labels.length);
  for (let i = 0; i < owner.length; i++) {
    owner[i] =
      (land.elev.data[i] as number) > land.seaLevel ? (labels[i] as number) : (grown[parentOf[i] as number] as number);
  }
  return owner;
}
