// Issue #950 round: the corridor both river arms work inside, the cells within a world cell of a world river's course, and the fine relief of the ground there.
import { boxBlur } from "../../../src/core/box-blur.ts";
import { fieldFrom, type Field } from "../../../src/core/grid.ts";
import { buildHeightfield, type UvWindow } from "../../../src/terrain/heightfield.ts";
import { detailForWindow } from "../../../src/world/detail-chain.ts";
import type { World } from "../../../src/world/types.ts";
import { cellsPerWorldCell } from "./common.ts";
import { type Pt, type Run } from "./course.ts";

// STAND-IN, not ruled: how far either side of the world's line a river may be laid, in world cells. One world cell is as far as the world's own course is known (its points stand a cell apart), and it is the tolerance the breakdown counted a river as drawn within.
export const CORRIDOR_WORLD_CELLS = 1;

export function corridorRadius(world: World, w: UvWindow): number {
  return Math.max(2, CORRIDOR_WORLD_CELLS * cellsPerWorldCell(w, world));
}

export type Corridor = {
  /** Distance from each cell to the nearest run's course, region cells (Infinity outside every corridor). */
  readonly dist: Float64Array;
  /** Which run is nearest (-1 outside). */
  readonly run: Int32Array;
  /** How far along that run's course the nearest point lies, 0 at its first point and 1 at its last. */
  readonly along: Float64Array;
  readonly radius: number;
};

export function corridorOf(runs: ReadonlyArray<Run>, gridW: number, gridH: number, radius: number): Corridor {
  const n = gridW * gridH;
  const dist = new Float64Array(n).fill(Infinity);
  const run = new Int32Array(n).fill(-1);
  const along = new Float64Array(n);
  runs.forEach((r, ri) => {
    const lens: number[] = [0];
    for (let i = 1; i < r.pts.length; i++) lens.push(lens[i - 1]! + Math.hypot(r.pts[i]!.x - r.pts[i - 1]!.x, r.pts[i]!.y - r.pts[i - 1]!.y));
    const total = Math.max(1e-9, lens[lens.length - 1]!);
    for (let i = 1; i < r.pts.length; i++) {
      const a = r.pts[i - 1]!;
      const b = r.pts[i]!;
      const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - radius));
      const x1 = Math.min(gridW - 1, Math.ceil(Math.max(a.x, b.x) + radius));
      const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - radius));
      const y1 = Math.min(gridH - 1, Math.ceil(Math.max(a.y, b.y) + radius));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      const segLen = Math.sqrt(len2);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len2)) : 0;
          const d = Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
          const c = x + y * gridW;
          if (d <= radius && d < (dist[c] as number)) {
            dist[c] = d;
            run[c] = ri;
            along[c] = ((lens[i - 1] as number) + t * segLen) / total;
          }
        }
      }
    }
  });
  return { dist, run, along, radius };
}

/** The ground's fine relief: each cell less the mean around it at about half the corridor's width, so a valley reads negative whatever the slope of the land it lies on. */
export function fineRelief(field: Field, radius: number): Field {
  const passes = Math.max(1, Math.round(radius / 2));
  const smooth = boxBlur(field, passes);
  const data = new Float64Array(field.data.length);
  for (let i = 0; i < data.length; i++) data[i] = (field.data[i] as number) - (smooth.data[i] as number);
  return fieldFrom(field.w, field.h, data);
}

export function quantileOf(values: readonly number[], q: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))]!;
}

export const cellOf = (p: Pt, gridW: number, gridH: number): number =>
  Math.min(gridW - 1, Math.max(0, Math.round(p.x))) + Math.min(gridH - 1, Math.max(0, Math.round(p.y))) * gridW;

/** The window's own detail before the chain floors it to its ancestors: `buildHeightfield` at the window's detail level, as `buildChainedField` in `src/world/detail-chain.ts` builds its `bare`. At depth most of the drawn ground is the ancestors' surface (the ceiling argument), whose fine relief is the creases of a resampled coarse grid; this field is the only fine relief there is. */
export function bareDetail(world: World, w: UvWindow, gridW: number, gridH: number): Field {
  return buildHeightfield({
    seed: world.recipe.seed,
    gridW,
    gridH,
    mapType: world.recipe.mapType,
    window: w,
    worldAspect: (world.recipe.gridW - 1) / (world.recipe.gridH - 1),
    detail: detailForWindow(w),
  });
}
