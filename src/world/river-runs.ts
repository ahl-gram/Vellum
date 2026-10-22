import { isMajorRiver, type River } from "../hydrology/rivers.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { World } from "./types.ts";

export type GridPoint = { readonly x: number; readonly y: number };

export type RiverRun = {
  readonly river: number;
  readonly major: boolean;
  readonly course: ReadonlyArray<GridPoint>;
  readonly acc: ReadonlyArray<number>;
  readonly leavesAtEdge: boolean;
  readonly endsInOcean: boolean;
};

type Box = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

type Frame = {
  readonly box: Box;
  readonly toRegion: (p: GridPoint) => GridPoint;
};

/** Liang-Barsky: the parameters t0 <= t1 of segment a-b inside the box, or null. */
function clipSegment(a: GridPoint, b: GridPoint, box: Box): readonly [number, number] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: ReadonlyArray<readonly [number, number]> = [
    [-dx, a.x - box.x0],
    [dx, box.x1 - a.x],
    [-dy, a.y - box.y0],
    [dy, box.y1 - a.y],
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

function courseLength(course: ReadonlyArray<GridPoint>): number {
  let length = 0;
  for (let i = 1; i < course.length; i++) {
    const a = course[i - 1] as GridPoint;
    const b = course[i] as GridPoint;
    length += Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
  }
  return length;
}

/** The sample count is one per region cell of each segment, at least one. */
export function densifyCourse(course: ReadonlyArray<GridPoint>): GridPoint[] {
  const out: GridPoint[] = [];
  for (let i = 1; i < course.length; i++) {
    const a = course[i - 1] as GridPoint;
    const b = course[i] as GridPoint;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const n = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy)));
    for (let k = i === 1 ? 0 : 1; k <= n; k++) out.push({ x: a.x + (dx * k) / n, y: a.y + (dy * k) / n });
  }
  return out;
}

function runsOfRiver(river: River, index: number, frame: Frame): RiverRun[] {
  const runs: RiverRun[] = [];
  const major = isMajorRiver(river);
  let course: GridPoint[] = [];
  let acc: number[] = [];
  const close = (leavesAtEdge: boolean): void => {
    if (course.length >= 2 && courseLength(course) >= 1) {
      runs.push({
        river: index,
        major,
        course,
        acc,
        leavesAtEdge,
        endsInOcean: !leavesAtEdge && river.endsInOcean,
      });
    }
    course = [];
    acc = [];
  };
  for (let i = 1; i < river.points.length; i++) {
    const a = river.points[i - 1] as River["points"][number];
    const b = river.points[i] as River["points"][number];
    const t = clipSegment(a, b, frame.box);
    if (t === null) {
      if (course.length > 0) close(true);
      continue;
    }
    const [t0, t1] = t;
    const at = (s: number): GridPoint => frame.toRegion({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });
    const accAt = (s: number): number => a.acc + (b.acc - a.acc) * s;
    if (course.length === 0) {
      course.push(at(t0));
      acc.push(accAt(t0));
    }
    course.push(at(t1));
    acc.push(accAt(t1));
    if (t1 < 1) close(true);
  }
  if (course.length > 0) close(false);
  return runs;
}

const peak = (run: RiverRun): number => Math.max(...run.acc);

/** Every maximal in-window stretch of every world river, clipped segment by segment so a river with one world vertex inside, or none, still crosses. Laid order: majors first, then the highest peak accumulation first; ties keep world river order, then run order. */
export function worldRiverRuns(world: World, window: UvWindow, gridW: number, gridH: number): RiverRun[] {
  const ww = world.recipe.gridW - 1;
  const wh = world.recipe.gridH - 1;
  const frame: Frame = {
    box: { x0: window.u0 * ww, x1: window.u1 * ww, y0: window.v0 * wh, y1: window.v1 * wh },
    toRegion: (p) => ({
      x: ((p.x / ww - window.u0) / (window.u1 - window.u0)) * (gridW - 1),
      y: ((p.y / wh - window.v0) / (window.v1 - window.v0)) * (gridH - 1),
    }),
  };
  const runs = world.rivers.flatMap((river, index) => runsOfRiver(river, index, frame));
  return runs.sort((a, b) => Number(b.major) - Number(a.major) || peak(b) - peak(a));
}
