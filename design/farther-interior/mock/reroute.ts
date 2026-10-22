// Issue #950 round, river arm A, re-route: every world river crossing the window (majors and minors) is laid along the cheapest path over the close-up's own ground between where it enters and where it leaves, kept inside a corridor a world cell either side of the world's line. It runs on the close-up the engine drew and touches no terrain: the roads, biomes and town seats around the rivers are NOT re-derived for the new rivers, so a still of this arm is a stand-in for the river alone.
import { createMinHeap } from "../../../src/core/heap.ts";
import { NEIGHBORS_8 } from "../../../src/core/grid.ts";
import { extractRivers, type River, type RiverPoint } from "../../../src/hydrology/rivers.ts";
import { extendMouthToWater, mouthReachCells } from "../../../src/world/region-rivers.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { bareDetail, cellOf, corridorOf, corridorRadius, fineRelief, quantileOf } from "./corridor.ts";
import { densify, densityOf, worldRiverThreshold, worldRuns, type Run } from "./course.ts";

// STAND-IN, not ruled: how strongly the path prefers low ground. A step costs its length times (1 + K x the cell's fine relief, scaled 0 to 1 over the corridor). The relief is the window's own detail before the chain floors it (`bareDetail` in corridor.ts): on the drawn ground at depth a path follows the creases of the resampled world surface, in long straight runs.
export const VALLEY_K = 6;
// STAND-IN, not ruled: a pull back toward the world's line, as the square of the distance from it over the corridor's half-width, in the same units as the relief term. Without it the path runs along the corridor's edge for long stretches wherever the detail there is lower (seen at the round's first try, seed 42 at Laukuwelua, band 6).
export const CENTRE_PULL = 1;
// `SHADOW_RADIUS` and `SHADOW_FRACTION` in `src/world/region-rivers.ts`, which are module-private: an extracted river half within two cells of a laid-in one is a double and is dropped.
const SHADOW_RADIUS = 2;
const SHADOW_FRACTION = 0.5;

export type RoutedRun = { readonly run: Run; readonly path: number[]; readonly fellBack: boolean };

function dijkstra(start: number, isTarget: (c: number) => boolean, passable: (c: number) => boolean, stepCost: (c: number) => number, w: number, h: number): number[] | null {
  const n = w * h;
  const best = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const heap = createMinHeap();
  best[start] = 0;
  heap.push(start, 0);
  while (heap.size() > 0) {
    const c = heap.pop();
    if (isTarget(c) && c !== start) {
      const path: number[] = [];
      for (let k = c; k !== -1; k = prev[k] as number) path.push(k);
      return path.reverse();
    }
    const x = c % w;
    const y = (c / w) | 0;
    for (const [dx, dy, len] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nc = nx + ny * w;
      if (!passable(nc) && !isTarget(nc)) continue;
      const d = (best[c] as number) + len * stepCost(nc);
      if (d < (best[nc] as number)) {
        best[nc] = d;
        prev[nc] = c;
        heap.push(nc, d);
      }
    }
  }
  return null;
}

export function rerouteRivers(world: World, window: UvWindow, region: World): { rivers: River[]; routed: RoutedRun[] } {
  const { w, h } = region.elev;
  const sea = region.seaLevel;
  const isLand = (c: number): boolean => (region.elev.data[c] as number) > sea;
  const R = corridorRadius(world, window);
  const runs = worldRuns(world, window)
    .map((r) => ({ r, top: Math.max(...r.acc) }))
    .sort((a, b) => Number(b.r.major) - Number(a.r.major) || b.top - a.top)
    .map((x) => x.r);
  const relief = fineRelief(bareDetail(world, window, w, h), R);
  const laid = new Uint8Array(w * h);
  const routed: RoutedRun[] = [];

  for (const run of runs) {
    const corridor = corridorOf([run], w, h, R);
    const inside: number[] = [];
    for (let c = 0; c < w * h; c++) if (Number.isFinite(corridor.dist[c] as number) && isLand(c)) inside.push(relief.data[c] as number);
    const lo = quantileOf(inside, 0.05);
    const hi = quantileOf(inside, 0.95);
    const span = Math.max(1e-12, hi - lo);
    const stepCost = (c: number): number => {
      const d = Math.min(1, (corridor.dist[c] as number) / R);
      return 1 + VALLEY_K * (Math.min(1, Math.max(0, ((relief.data[c] as number) - lo) / span)) + CENTRE_PULL * d * d);
    };
    const course = densify(run.pts);
    let startIdx = 0;
    while (startIdx < course.length - 1 && !isLand(cellOf(course[startIdx]!, w, h))) startIdx++;
    const start = cellOf(course[startIdx]!, w, h);
    const tail = run.pts[run.pts.length - 1]!;
    const nearTail = (c: number, r: number): boolean => Math.hypot((c % w) - tail.x, ((c / w) | 0) - tail.y) <= r;
    const exit = cellOf(tail, w, h);
    const isTarget = run.endsInOcean
      ? (c: number): boolean => !isLand(c) && nearTail(c, R) && Number.isFinite(corridor.dist[c] as number)
      : run.endsAtConfluence
        ? (c: number): boolean => (laid[c] === 1 && nearTail(c, R)) || c === exit
        : (c: number): boolean => c === exit;
    const inCorridor = (c: number): boolean => Number.isFinite(corridor.dist[c] as number) && isLand(c);
    let path = dijkstra(start, isTarget, inCorridor, stepCost, w, h);
    let fellBack = false;
    if (path === null) {
      // The corridor is cut (by water, or the tail sits off the land): allow any land, then anything, before giving up to the world's own line.
      path = dijkstra(start, isTarget, isLand, stepCost, w, h) ?? dijkstra(start, isTarget, () => true, stepCost, w, h);
      fellBack = true;
    }
    if (path === null || path.length < 2) {
      path = course.map((p) => cellOf(p, w, h)).filter((c, i, a) => i === 0 || c !== a[i - 1]);
      fellBack = true;
    }
    for (const c of path) laid[c] = 1;
    routed.push({ run, path, fellBack });
  }

  const reach = mouthReachCells(w, window, world.recipe.gridW);
  const laidRivers: River[] = routed.map(({ run, path }) => {
    const n = path.length;
    const a0 = run.acc[0] as number;
    const a1 = run.acc[run.acc.length - 1] as number;
    const pts: RiverPoint[] = path.map((c, i) => ({ x: c % w, y: (c / w) | 0, acc: a0 + ((a1 - a0) * i) / Math.max(1, n - 1) }));
    const lastLand = isLand(path[n - 1] as number);
    if (run.endsInOcean && lastLand) return { points: extendMouthToWater(pts, region.elev, region.flow, sea, reach), endsInOcean: true };
    return { points: pts, endsInOcean: run.endsInOcean };
  });

  const threshold = worldRiverThreshold(world) * densityOf(world, window);
  const extracted = extractRivers(region.elev, region.flow, sea, { absoluteThreshold: threshold });
  const shadow = new Set<number>();
  for (const c of laid.keys()) {
    if (laid[c] !== 1) continue;
    const cx = c % w;
    const cy = (c / w) | 0;
    for (let dy = -SHADOW_RADIUS; dy <= SHADOW_RADIUS; dy++) {
      for (let dx = -SHADOW_RADIUS; dx <= SHADOW_RADIUS; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) shadow.add(nx + ny * w);
      }
    }
  }
  const uncovered = extracted.filter((r) => r.points.filter((p) => shadow.has(Math.round(p.x) + Math.round(p.y) * w)).length / r.points.length < SHADOW_FRACTION);
  return { rivers: [...laidRivers, ...uncovered], routed };
}
