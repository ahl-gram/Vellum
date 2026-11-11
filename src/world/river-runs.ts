import { isMajorRiver, type River } from "../hydrology/rivers.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { clipSegment, windowFrame, type WindowFrame } from "./region-parent.ts";
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

function courseLength(course: ReadonlyArray<GridPoint>): number {
  let length = 0;
  for (let i = 1; i < course.length; i++) {
    const a = course[i - 1] as GridPoint;
    const b = course[i] as GridPoint;
    length += Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
  }
  return length;
}

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

function runsOfRiver(river: River, index: number, frame: WindowFrame): RiverRun[] {
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

export function worldRiverRuns(world: World, window: UvWindow, gridW: number, gridH: number): RiverRun[] {
  const frame = windowFrame(world.recipe.gridW, world.recipe.gridH, window, gridW, gridH);
  const runs = world.rivers.flatMap((river, index) => runsOfRiver(river, index, frame));
  return runs.sort((a, b) => Number(b.major) - Number(a.major) || peak(b) - peak(a));
}
