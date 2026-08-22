import { isMajorRiver } from "../hydrology/rivers.ts";
import { bfsPath } from "../core/bfs-path.ts";
import type { SettlementKind } from "../society/sites.ts";
import type { World } from "../world/types.ts";

/** `k` is the event's integer step along the road chain: fork keys use it, never `dist`, which is an accumulated float no two libm round alike. */
export type RibbonEvent =
  | {
      readonly kind: "waypoint";
      readonly dist: number;
      readonly k: number;
      readonly index: number;
      readonly name: string;
      readonly tier: SettlementKind;
      readonly endpoint: boolean;
    }
  | { readonly kind: "crossing"; readonly dist: number; readonly k: number; readonly name: string | null; readonly major: boolean }
  | { readonly kind: "branch"; readonly dist: number; readonly k: number; readonly side: -1 | 1; readonly toName: string }
  | { readonly kind: "summit"; readonly dist: number; readonly k: number; readonly rel: number };

const MAX_BRANCHES = 10;

function cheb(w: number, a: number, b: number): number {
  return Math.max(Math.abs((a % w) - (b % w)), Math.abs(((a / w) | 0) - ((b / w) | 0)));
}

function riverIndexByCell(world: World): Map<number, number> {
  const w = world.elev.w;
  const map = new Map<number, number>();
  world.rivers.forEach((river, i) => {
    for (const p of river.points) {
      const c = p.x + p.y * w;
      if (!map.has(c)) map.set(c, i);
    }
  });
  return map;
}

function waypointEvents(
  world: World,
  chain: ReadonlyArray<number>,
  dists: ReadonlyArray<number>,
  fromIdx: number,
  toIdx: number,
): RibbonEvent[] {
  const w = world.elev.w;
  const out: RibbonEvent[] = [];
  world.settlements.forEach((s, i) => {
    const cell = s.x + s.y * w;
    for (let k = 0; k < chain.length; k++) {
      if (cheb(w, chain[k] as number, cell) <= 1) {
        out.push({
          kind: "waypoint",
          dist: dists[k] as number,
          k,
          index: i,
          name: s.name,
          tier: s.kind,
          endpoint: i === fromIdx || i === toIdx,
        });
        return;
      }
    }
  });
  return out;
}

function crossingEvents(
  world: World,
  chain: ReadonlyArray<number>,
  dists: ReadonlyArray<number>,
): RibbonEvent[] {
  const rivers = riverIndexByCell(world);
  const out: RibbonEvent[] = [];
  let runStart = -1;
  for (let k = 0; k <= chain.length; k++) {
    const wet = k < chain.length && world.riverCells[chain[k] as number] === 1;
    if (wet && runStart < 0) runStart = k;
    if (!wet && runStart >= 0) {
      const mid = (runStart + k - 1) >> 1;
      const idx = rivers.get(chain[mid] as number);
      const river = idx === undefined ? undefined : world.rivers[idx];
      out.push({
        kind: "crossing",
        dist: dists[mid] as number,
        k: mid,
        name: idx === undefined ? null : (world.names.rivers.get(idx) ?? null),
        major: river !== undefined && isMajorRiver(river),
      });
      runStart = -1;
    }
  }
  return out;
}

function branchEvents(
  world: World,
  mask: Uint8Array,
  chain: ReadonlyArray<number>,
  dists: ReadonlyArray<number>,
  onRoute: ReadonlySet<number>,
): RibbonEvent[] {
  const w = world.elev.w;
  const h = world.elev.h;
  const chainSet = new Set(chain);
  const settlementByCell = new Map<number, number>();
  world.settlements.forEach((s, i) => settlementByCell.set(s.x + s.y * w, i));
  const out: RibbonEvent[] = [];
  let lastK = -10;
  for (let k = 2; k < chain.length - 2 && out.length < MAX_BRANCHES; k++) {
    const c = chain[k] as number;
    const x = c % w;
    const y = (c / w) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const n = nx + ny * w;
        if (!mask[n] || chainSet.has(n)) continue;
        if (cheb(w, n, chain[k - 1] as number) <= 1 || cheb(w, n, chain[k + 1] as number) <= 1) continue;
        if (k - lastK < 4) continue;
        const walked = bfsPath(w, h, n, (g) => settlementByCell.has(g), (g) => mask[g] === 1 && !chainSet.has(g));
        if (!walked) continue;
        const destIdx = settlementByCell.get(walked[walked.length - 1] as number);
        if (destIdx === undefined || onRoute.has(destIdx)) continue;
        const t = travelDir(chain, w, k);
        const cross = t.x * dy - t.y * dx;
        out.push({
          kind: "branch",
          dist: dists[k] as number,
          k,
          side: cross > 0 ? 1 : -1,
          toName: (world.settlements[destIdx] as { name: string }).name,
        });
        lastK = k;
      }
    }
  }
  return out;
}

function travelDir(chain: ReadonlyArray<number>, w: number, k: number): { x: number; y: number } {
  const a = chain[Math.max(0, k - 2)] as number;
  const b = chain[Math.min(chain.length - 1, k + 2)] as number;
  const dx = (b % w) - (a % w);
  const dy = ((b / w) | 0) - ((a / w) | 0);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function summitEvent(
  world: World,
  chain: ReadonlyArray<number>,
  dists: ReadonlyArray<number>,
): RibbonEvent | null {
  const rel = (c: number): number =>
    (world.elev.data[c] as number - world.seaLevel) / (1 - world.seaLevel);
  let bestK = -1;
  let bestRel = -Infinity;
  for (let k = 5; k < chain.length - 5; k++) {
    const r = rel(chain[k] as number);
    if (r > bestRel) {
      bestRel = r;
      bestK = k;
    }
  }
  if (bestK < 0) return null;
  const ends = Math.max(rel(chain[0] as number), rel(chain[chain.length - 1] as number));
  if (bestRel - ends < 0.05) return null;
  return { kind: "summit", dist: dists[bestK] as number, k: bestK, rel: bestRel };
}

export function findEvents(
  world: World,
  mask: Uint8Array,
  chain: ReadonlyArray<number>,
  dists: ReadonlyArray<number>,
  fromIdx: number,
  toIdx: number,
): RibbonEvent[] {
  const waypoints = waypointEvents(world, chain, dists, fromIdx, toIdx);
  const onRoute = new Set(waypoints.map((e) => (e as { index: number }).index));
  const events = [
    ...waypoints,
    ...crossingEvents(world, chain, dists),
    ...branchEvents(world, mask, chain, dists, onRoute),
  ];
  const summit = summitEvent(world, chain, dists);
  if (summit) events.push(summit);
  return events.sort((a, b) => a.dist - b.dist);
}
