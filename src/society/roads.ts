import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";
import { slopeField } from "../terrain/slope.ts";
import { labelLandmasses } from "../world/landmass.ts";
import type { RealmsResult } from "./realms.ts";
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

type Wiring = {
  readonly w: number;
  readonly h: number;
  readonly n: number;
  readonly data: Field["data"];
  readonly seaLevel: number;
  readonly terrainCost: (i: number) => number;
  readonly roads: Road[];
};

type RealmWeb = {
  readonly cells: ReadonlyArray<number>;
  readonly principal: Settlement | undefined;
};

export function buildRoads(
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  settlements: ReadonlyArray<Settlement>,
  realms: RealmsResult,
): Road[] {
  const { w, h, data } = elev;
  const { labels, seats } = realms;
  if (seats.length === 0) return [];

  const slope = slopeField(elev);
  const terrainCost = (i: number): number =>
    1 +
    (slope.data[i] as number) * SLOPE_PENALTY +
    (riverCells[i] === 1 ? RIVER_CROSSING : 0);
  const wiring: Wiring = { w, h, n: w * h, data, seaLevel, terrainCost, roads: [] };

  const budgets = realmBudgets(labels, seats.length, wiring.n);
  if (budgets === null) return [];
  const { ids: lmIds } = labelLandmasses(elev, seaLevel);
  const webs = weaveRealmWebs(wiring, settlements, labels, seats, lmIds, budgets);
  layRoyalTrunks(wiring, webs);
  return wiring.roads;
}

function realmBudgets(labels: Int16Array, realmCount: number, n: number): number[] | null {
  const cells = new Array<number>(realmCount).fill(0);
  let labelled = 0;
  let present = 0;
  for (let i = 0; i < n; i++) {
    const r = labels[i] as number;
    if (r >= 0 && r < realmCount) {
      if (cells[r] === 0) present++;
      cells[r] = (cells[r] as number) + 1;
      labelled++;
    }
  }
  if (present === 0) return null;
  const mean = labelled / present;
  return cells.map((c) => Math.max(1, Math.round(VILLAGE_BUDGET * Math.sqrt(c / mean))));
}

function weaveRealmWebs(
  wiring: Wiring,
  settlements: ReadonlyArray<Settlement>,
  labels: Int16Array,
  seats: ReadonlyArray<number>,
  lmIds: Int32Array,
  budgets: ReadonlyArray<number>,
): RealmWeb[] {
  const { w } = wiring;
  const cellOf = (s: Settlement): number => s.x + s.y * w;
  const webs: RealmWeb[] = [];
  for (let r = 0; r < seats.length; r++) {
    const members = settlements.filter((s) => (labels[cellOf(s)] as number) === r);
    const seatIdx = seats[r] as number;
    const principal = seatIdx >= 0 ? settlements[seatIdx] : topByScore(members);
    const cells: number[] = [];
    if (members.length === 0 || principal === undefined) {
      webs.push({ cells, principal });
      continue;
    }
    const byShore = new Map<number, Settlement[]>();
    for (const s of members) {
      const lm = lmIds[cellOf(s)] as number;
      const group = byShore.get(lm);
      if (group) group.push(s);
      else byShore.set(lm, [s]);
    }
    const principalLm = lmIds[cellOf(principal)] as number;
    if (!byShore.has(principalLm)) byShore.set(principalLm, []);
    const roadsStart = wiring.roads.length;
    for (const [lm, group] of byShore) {
      const anchor = lm === principalLm ? principal : topByScore(group);
      if (anchor === undefined) continue;
      const network = new Uint8Array(wiring.n);
      network[cellOf(anchor)] = 1;
      cells.push(cellOf(anchor));
      connectGroup(wiring, network, anchor, group, budgets[r] as number);
    }
    for (let i = roadsStart; i < wiring.roads.length; i++) {
      for (const p of (wiring.roads[i] as Road).points) cells.push(p.x + p.y * w);
    }
    webs.push({ cells, principal });
  }
  return webs;
}

function layRoyalTrunks(wiring: Wiring, webs: ReadonlyArray<RealmWeb>): void {
  const web = new Uint8Array(wiring.n);
  let seeded = false;
  for (const { cells, principal } of webs) {
    if (cells.length === 0) continue;
    if (seeded && principal !== undefined) {
      const ride = new Uint8Array(wiring.n);
      for (const c of cells) ride[c] = 1;
      connectToNetwork(wiring, web, principal.x, principal.y, "trunk", Infinity, ride);
    }
    for (const c of cells) web[c] = 1;
    seeded = true;
  }
}

function connectGroup(
  wiring: Wiring,
  network: Uint8Array,
  anchor: Settlement,
  members: ReadonlyArray<Settlement>,
  villageBudget: number,
): void {
  const anchorDist = (s: Settlement): number =>
    Math.hypot(s.x - anchor.x, s.y - anchor.y);
  const towns = members
    .filter((s) => s.kind === "town")
    .sort((a, b) => anchorDist(a) - anchorDist(b));
  for (const t of towns) connectToNetwork(wiring, network, t.x, t.y, "trunk", Infinity);
  const villages = members
    .filter((s) => s.kind === "village")
    .sort((a, b) => anchorDist(a) - anchorDist(b));
  for (const v of villages) connectToNetwork(wiring, network, v.x, v.y, "lane", villageBudget);
}

function connectToNetwork(
  wiring: Wiring,
  network: Uint8Array,
  sx: number,
  sy: number,
  rank: Road["rank"],
  budget: number,
  ride?: Uint8Array,
): void {
  const { w, h, n, data, seaLevel, terrainCost } = wiring;
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
      if (network[ni] || (ride !== undefined && ride[ni] === 1)) step *= REUSE_DISCOUNT;
      const nd = d + step;
      if (nd < (dist[ni] as number)) {
        dist[ni] = nd;
        prev[ni] = i;
        heap.push(ni, nd);
      }
    }
  }
  if (found === -1) return; // unreachable (another island): no road

  const points: RoadPoint[] = [];
  let cur = found;
  while (cur !== -1) {
    points.push({ x: cur % w, y: (cur / w) | 0 });
    cur = prev[cur] as number;
  }
  points.reverse();
  for (const p of points) network[p.x + p.y * w] = 1;
  wiring.roads.push({ points, rank });
}

function topByScore(group: ReadonlyArray<Settlement>): Settlement | undefined {
  let best: Settlement | undefined;
  for (const s of group) {
    if (
      best === undefined ||
      s.score > best.score ||
      (s.score === best.score && (s.x < best.x || (s.x === best.x && s.y < best.y)))
    ) {
      best = s;
    }
  }
  return best;
}
