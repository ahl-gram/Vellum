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

export function buildRoads(
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  settlements: ReadonlyArray<Settlement>,
  realms: RealmsResult,
): Road[] {
  const { w, h, data } = elev;
  const n = w * h;
  const slope = slopeField(elev);
  const { labels, seats } = realms;
  if (seats.length === 0) return [];

  const terrainCost = (i: number): number =>
    1 +
    (slope.data[i] as number) * SLOPE_PENALTY +
    (riverCells[i] === 1 ? RIVER_CROSSING : 0);

  const roads: Road[] = [];

  const connect = (
    network: Uint8Array,
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
    if (found === -1) return; // unreachable (another island): no road

    const points: RoadPoint[] = [];
    let cur = found;
    while (cur !== -1) {
      points.push({ x: cur % w, y: (cur / w) | 0 });
      cur = prev[cur] as number;
    }
    points.reverse();
    for (const p of points) network[p.x + p.y * w] = 1;
    roads.push({ points, rank });
  };

  const connectGroup = (
    network: Uint8Array,
    anchor: Settlement,
    members: ReadonlyArray<Settlement>,
    villageBudget: number,
  ): void => {
    const anchorDist = (s: Settlement): number =>
      Math.hypot(s.x - anchor.x, s.y - anchor.y);
    const towns = members
      .filter((s) => s.kind === "town")
      .sort((a, b) => anchorDist(a) - anchorDist(b));
    for (const t of towns) connect(network, t.x, t.y, "trunk", Infinity);
    const villages = members
      .filter((s) => s.kind === "village")
      .sort((a, b) => anchorDist(a) - anchorDist(b));
    for (const v of villages) connect(network, v.x, v.y, "lane", villageBudget);
  };

  const { ids: lmIds } = labelLandmasses(elev, seaLevel);
  const cellOf = (s: Settlement): number => s.x + s.y * w;

  const realmCells = new Array<number>(seats.length).fill(0);
  let labelled = 0;
  let realmsPresent = 0;
  for (let i = 0; i < n; i++) {
    const r = labels[i] as number;
    if (r >= 0 && r < seats.length) {
      if (realmCells[r] === 0) realmsPresent++;
      realmCells[r] = (realmCells[r] as number) + 1;
      labelled++;
    }
  }
  if (realmsPresent === 0) return [];
  const meanCells = labelled / realmsPresent;

  // A seat of -1 is a survey window that excludes the seat; the realm then anchors at its top settlement.
  const realmWebCells: number[][] = [];
  const principalAnchor: Array<Settlement | undefined> = [];
  for (let r = 0; r < seats.length; r++) {
    const members = settlements.filter((s) => (labels[cellOf(s)] as number) === r);
    const seatIdx = seats[r] as number;
    const principal = seatIdx >= 0 ? settlements[seatIdx] : topByScore(members);
    principalAnchor.push(principal);
    const cells: number[] = [];
    if (members.length === 0 || principal === undefined) {
      realmWebCells.push(cells);
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
    const villageBudget = Math.max(
      1,
      Math.round(VILLAGE_BUDGET * Math.sqrt((realmCells[r] as number) / meanCells)),
    );
    const roadsStart = roads.length;
    for (const [lm, group] of byShore) {
      const anchor = lm === principalLm ? principal : topByScore(group);
      if (anchor === undefined) continue;
      const network = new Uint8Array(n);
      network[cellOf(anchor)] = 1;
      cells.push(cellOf(anchor));
      connectGroup(network, anchor, group, villageBudget);
    }
    for (let i = roadsStart; i < roads.length; i++) {
      for (const p of (roads[i] as Road).points) cells.push(p.x + p.y * w);
    }
    realmWebCells.push(cells);
  }

  // Royal trunks: each realm's principal anchor joins the web of realms already joined, where land allows.
  const web = new Uint8Array(n);
  let webSeeded = false;
  for (let r = 0; r < seats.length; r++) {
    const cells = realmWebCells[r] as number[];
    if (cells.length === 0) continue;
    const principal = principalAnchor[r];
    if (webSeeded && principal !== undefined) {
      connect(web, principal.x, principal.y, "trunk", Infinity);
    }
    for (const c of cells) web[c] = 1;
    webSeeded = true;
  }

  return roads;
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
