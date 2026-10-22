import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { densifyCourse, worldRiverRuns } from "../../src/world/river-runs.ts";
import type { World } from "../../src/world/types.ts";

/** The census's and the guards' one instrument for rivers and roads, the Issue #395 breakdown's per-feature rule: a world feature crossing a close-up counts as drawn when at least half of its in-window course lies within max(3 cells, one world cell) of a drawn one. It clips with its own copy of the clip, not an import of `worldRiverRuns`, so a guard built on it does not share that function's code. */

export type Pt = { readonly x: number; readonly y: number };

export const MATCH_FRACTION = 0.5;

export function matchTolerance(window: UvWindow, gridW: number, worldGridW: number): number {
  return Math.max(3, (gridW - 1) / ((window.u1 - window.u0) * (worldGridW - 1)));
}

type Frame = {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
  readonly toRegion: (p: Pt) => Pt;
};

function frameOf(world: World, window: UvWindow, gridW: number, gridH: number): Frame {
  const ww = world.recipe.gridW - 1;
  const wh = world.recipe.gridH - 1;
  return {
    x0: window.u0 * ww,
    x1: window.u1 * ww,
    y0: window.v0 * wh,
    y1: window.v1 * wh,
    toRegion: (p) => ({
      x: ((p.x / ww - window.u0) / (window.u1 - window.u0)) * (gridW - 1),
      y: ((p.y / wh - window.v0) / (window.v1 - window.v0)) * (gridH - 1),
    }),
  };
}

function clip(a: Pt, b: Pt, f: Frame): { readonly t0: number; readonly t1: number } | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: ReadonlyArray<readonly [number, number]> = [
    [-dx, a.x - f.x0],
    [dx, f.x1 - a.x],
    [-dy, a.y - f.y0],
    [dy, f.y1 - a.y],
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
  return { t0, t1 };
}

const at = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

export function inWindowCourse(
  points: ReadonlyArray<Pt>,
  world: World,
  window: UvWindow,
  gridW: number,
  gridH: number,
): Pt[] {
  const f = frameOf(world, window, gridW, gridH);
  const samples: Pt[] = [];
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1] as Pt;
    const b = points[i] as Pt;
    const c = clip(a, b, f);
    if (c === null) continue;
    const from = f.toRegion(at(a, b, c.t0));
    const to = f.toRegion(at(a, b, c.t1));
    const span = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
    length += span;
    const n = Math.max(1, Math.ceil(span));
    for (let k = 0; k <= n; k++) samples.push(at(from, to, k / n));
  }
  return length < 1 ? [] : samples;
}

export function distanceToPolyline(p: Pt, line: ReadonlyArray<Pt>): number {
  const first = line[0];
  if (first === undefined) return Infinity;
  if (line.length === 1) return Math.sqrt((p.x - first.x) ** 2 + (p.y - first.y) ** 2);
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1] as Pt;
    const b = line[i] as Pt;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
    const ex = p.x - (a.x + t * dx);
    const ey = p.y - (a.y + t * dy);
    best = Math.min(best, Math.sqrt(ex * ex + ey * ey));
  }
  return best;
}

export function matchedFraction(
  course: ReadonlyArray<Pt>,
  drawn: ReadonlyArray<ReadonlyArray<Pt>>,
  tolerance: number,
): number {
  if (course.length === 0) return 0;
  const near = course.filter((p) => drawn.some((d) => distanceToPolyline(p, d) <= tolerance)).length;
  return near / course.length;
}

const hasLandUnder = (course: ReadonlyArray<Pt>, region: World): boolean => {
  const { w, h, data } = region.elev;
  return course.some((p) => {
    const x = Math.min(w - 1, Math.max(0, Math.round(p.x)));
    const y = Math.min(h - 1, Math.max(0, Math.round(p.y)));
    return (data[x + y * w] as number) > region.seaLevel;
  });
};

export function worldFeaturesDrawn(
  features: ReadonlyArray<ReadonlyArray<Pt>>,
  drawn: ReadonlyArray<ReadonlyArray<Pt>>,
  region: World,
  world: World,
  window: UvWindow,
): Array<boolean | undefined> {
  const { w, h } = region.elev;
  const tolerance = matchTolerance(window, w, world.recipe.gridW);
  return features.map((feature) => {
    const course = inWindowCourse(feature, world, window, w, h);
    if (course.length === 0 || !hasLandUnder(course, region)) return undefined;
    return matchedFraction(course, drawn, tolerance) >= MATCH_FRACTION;
  });
}

export function worldRiversDrawn(world: World, region: World, window: UvWindow): Array<boolean | undefined> {
  return worldFeaturesDrawn(
    world.rivers.map((r) => r.points),
    region.rivers.map((r) => r.points),
    region,
    world,
    window,
  );
}

export function worldRoadsDrawn(world: World, region: World, window: UvWindow): Array<boolean | undefined> {
  return worldFeaturesDrawn(
    world.roads.map((r) => r.points),
    region.roads.map((r) => r.points),
    region,
    world,
    window,
  );
}

export function leadsOut(points: ReadonlyArray<Pt>, world: World, window: UvWindow): boolean {
  const f = frameOf(world, window, 2, 2);
  for (let i = 1; i < points.length; i++) {
    const c = clip(points[i - 1] as Pt, points[i] as Pt, f);
    if (c !== null && (c.t0 > 0 || c.t1 < 1)) return true;
  }
  return false;
}

/** How many rivers the close-up laid from a world river: one per run of `worldRiverRuns` with land under it, and they come first in `region.rivers`. */
export function laidRiverCount(world: World, region: World, window: UvWindow): number {
  const { w, h } = region.elev;
  return worldRiverRuns(world, window, w, h).filter((run) => hasLandUnder(densifyCourse(run.course), region)).length;
}
