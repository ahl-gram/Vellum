// Issue #950 round: each world river's course through a window, as runs in region grid coordinates. Both river arms start here: a run is the stretch of one world river between where it enters the window (or rises inside it) and where it leaves (or ends inside it, at the sea or on another river).
import { isMajorRiver, riverThreshold } from "../../../src/hydrology/rivers.ts";
import { regionDensityRatio } from "../../../src/world/region-rivers.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { GRID_H, GRID_W } from "./common.ts";

export type Pt = { readonly x: number; readonly y: number };

export type Run = {
  readonly river: number;
  readonly major: boolean;
  /** Source to mouth, region grid coordinates, the world's own vertices plus the window-edge crossings. */
  readonly pts: ReadonlyArray<Pt>;
  /** The world's accumulation at each point, scaled by the window's density ratio, so it reads in region cells as `projectWorldMajors` in `src/world/region-rivers.ts` scales it. */
  readonly acc: ReadonlyArray<number>;
  readonly entersAtEdge: boolean;
  readonly leavesAtEdge: boolean;
  /** The run's last point is the world river's tail and the river ends in the sea. */
  readonly endsInOcean: boolean;
  /** The run's last point is the world river's tail and the river ends on another river (a tributary's confluence). */
  readonly endsAtConfluence: boolean;
};

/** Liang-Barsky: the parameters t0 <= t1 of segment a-b inside the rect, or null. */
function clipT(a: Pt, b: Pt, x0: number, y0: number, x1: number, y1: number): [number, number] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: Array<[number, number]> = [
    [-dx, a.x - x0],
    [dx, x1 - a.x],
    [-dy, a.y - y0],
    [dy, y1 - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  return [t0, t1];
}

/** `worldRiverThreshold` in `src/world/region-rivers.ts`, which is module-private: the world's own river threshold, the default quantile over land. */
export function worldRiverThreshold(world: World): number {
  const landAcc: number[] = [];
  for (let i = 0; i < world.elev.data.length; i++) {
    if ((world.elev.data[i] as number) > world.seaLevel) landAcc.push(world.flow.acc[i] as number);
  }
  return landAcc.length === 0 ? Infinity : riverThreshold(landAcc);
}

export function densityOf(world: World, w: UvWindow): number {
  return regionDensityRatio(world.recipe.gridW, world.recipe.gridH, w, GRID_W, GRID_H);
}

export function worldRuns(world: World, w: UvWindow): Run[] {
  const Ww = world.recipe.gridW - 1;
  const Wh = world.recipe.gridH - 1;
  const [x0, x1, y0, y1] = [w.u0 * Ww, w.u1 * Ww, w.v0 * Wh, w.v1 * Wh];
  const density = densityOf(world, w);
  const toR = (p: Pt): Pt => ({ x: ((p.x / Ww - w.u0) / (w.u1 - w.u0)) * (GRID_W - 1), y: ((p.y / Wh - w.v0) / (w.v1 - w.v0)) * (GRID_H - 1) });
  const runs: Run[] = [];
  world.rivers.forEach((river, ri) => {
    const major = isMajorRiver(river);
    const P = river.points;
    let pts: Pt[] = [];
    let acc: number[] = [];
    let enters = false;
    const flush = (leaves: boolean, tail: boolean): void => {
      if (pts.length >= 2) {
        runs.push({
          river: ri,
          major,
          pts,
          acc,
          entersAtEdge: enters,
          leavesAtEdge: leaves,
          endsInOcean: tail && river.endsInOcean,
          endsAtConfluence: tail && !river.endsInOcean,
        });
      }
      pts = [];
      acc = [];
    };
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1]!;
      const b = P[i]!;
      const t = clipT(a, b, x0, y0, x1, y1);
      if (t === null) {
        if (pts.length > 0) flush(true, false);
        continue;
      }
      const [t0, t1] = t;
      const at = (s: number): Pt => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });
      const accAt = (s: number): number => (a.acc + (b.acc - a.acc) * s) * density;
      if (pts.length === 0) {
        // A run opening on the river's first segment unclipped starts at its source; any other opening is a crossing of the window's edge.
        enters = i > 1 || t0 > 0;
        pts.push(toR(at(t0)));
        acc.push(accAt(t0));
      }
      pts.push(toR(at(t1)));
      acc.push(accAt(t1));
      if (t1 < 1) flush(true, false);
    }
    if (pts.length > 0) flush(false, true);
  });
  return runs;
}

/** Every run's points sampled about once per region cell, for distance fields. */
export function densify(pts: ReadonlyArray<Pt>): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
    for (let k = i === 1 ? 0 : 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}

export function polylineLength(pts: ReadonlyArray<Pt>): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  return s;
}
