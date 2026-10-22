import { bfsDistance } from "../core/bfs-distance.ts";
import type { Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";
import type { FlowResult } from "../hydrology/flow.ts";
import { extractRivers, riverThreshold, type River, type RiverPoint } from "../hydrology/rivers.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { corridorRadius, fineRelief, routeRun } from "./river-route.ts";
import { densifyCourse, worldRiverRuns, type RiverRun } from "./river-runs.ts";
import type { World } from "./types.ts";

/** A policy cap, not a derived bound: past about this far the walk stops repairing a mouth and starts inventing a river, so a run needing further is left as the parent drew it (Issue #443 records the ones that do). */
const MOUTH_REACH_PARENT_CELLS = 3;
const SHADOW_FRACTION = 0.5;
const DOUBLE_REACH_FLOOR = 3;

export function mouthReachCells(gridW: number, window: UvWindow, worldGridW: number): number {
  const du = window.u1 - window.u0;
  if (!(du > 0) || worldGridW < 2 || gridW < 2) return MOUTH_REACH_PARENT_CELLS;
  return Math.ceil((MOUTH_REACH_PARENT_CELLS * (gridW - 1)) / (du * (worldGridW - 1)));
}

/** Areal density ratio: flow accumulation scales linearly with it, so the world river threshold multiplies by it with exponent 1. */
export function regionDensityRatio(
  worldGridW: number,
  worldGridH: number,
  window: UvWindow,
  gridW: number,
  gridH: number,
): number {
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  return ((gridW - 1) * (gridH - 1)) / (du * dv * (worldGridW - 1) * (worldGridH - 1));
}

function worldRiverThreshold(world: World): number {
  const { data } = world.elev;
  const acc = world.flow.acc;
  const landAcc: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if ((data[i] as number) > world.seaLevel) landAcc.push(acc[i] as number);
  }
  if (landAcc.length === 0) return Infinity;
  return riverThreshold(landAcc); // default quantile 0.985, minAcc 8 (matches generateWorld)
}

export function regionRiverThreshold(world: World, window: UvWindow, gridW: number, gridH: number): number {
  return worldRiverThreshold(world) * regionDensityRatio(world.recipe.gridW, world.recipe.gridH, window, gridW, gridH);
}

/** A parent major's mouth is a parent SEA cell, and on a detailed region field that cell can be new land, leaving the river drawn short of the water (Issue #399). The region's own drainage is where the water would actually go. */
export function extendMouthToWater(
  points: ReadonlyArray<RiverPoint>,
  elev: Field,
  flow: FlowResult,
  seaLevel: number,
  maxSteps: number,
  meets: (cell: number) => boolean = () => false,
): ReadonlyArray<RiverPoint> {
  const last = points[points.length - 1];
  if (last === undefined) return points;
  const w = elev.w;
  let cell = Math.round(last.x) + Math.round(last.y) * w;
  if ((elev.data[cell] as number) <= seaLevel || meets(cell)) return points;

  const walked: RiverPoint[] = [];
  for (let step = 0; step < maxSteps; step++) {
    const next = flow.dir[cell] as number;
    if (next < 0) break;
    cell = next;
    walked.push({ x: cell % w, y: (cell / w) | 0, acc: last.acc });
    if ((elev.data[cell] as number) <= seaLevel || meets(cell)) return [...points, ...walked];
  }
  return points;
}

export type RiverGround = {
  readonly elev: Field;
  readonly flow: FlowResult;
  readonly seaLevel: number;
  /** The window's own unfloored detail: the field a river is routed over, which is `elev` itself on a sheet drawn without detail. */
  readonly ground: Field;
};

export type RegionRivers = {
  readonly laid: ReadonlyArray<River>;
  readonly extracted: ReadonlyArray<River>;
};

const onBorder = (cell: number, w: number, h: number): boolean => {
  const x = cell % w;
  const y = (cell / w) | 0;
  return x === 0 || y === 0 || x === w - 1 || y === h - 1;
};

const cellOfPoint = (p: { readonly x: number; readonly y: number }, w: number, h: number): number =>
  clamp(Math.round(p.x), 0, w - 1) + clamp(Math.round(p.y), 0, h - 1) * w;

/** A run with no land under its densified course is a mouth over the close-up's own sea, where a river would draw a stub on the water. */
function hasLandUnder(run: RiverRun, elev: Field, seaLevel: number): boolean {
  return densifyCourse(run.course).some((p) => (elev.data[cellOfPoint(p, elev.w, elev.h)] as number) > seaLevel);
}

/** Integer cell points whose accumulation runs linearly from the run's first to its last, in the window's own density. */
function pointsAlong(path: ReadonlyArray<number>, run: RiverRun, density: number, w: number): RiverPoint[] {
  const first = (run.acc[0] as number) * density;
  const last = (run.acc[run.acc.length - 1] as number) * density;
  return path.map((cell, i) => ({
    x: cell % w,
    y: (cell / w) | 0,
    acc: first + ((last - first) * i) / Math.max(1, path.length - 1),
  }));
}

/** An extracted river is dropped when at least `SHADOW_FRACTION` of its points lie within `reach` cells of a laid one. */
function unshadowed(extracted: ReadonlyArray<River>, laid: Uint8Array, reach: number, w: number, h: number): River[] {
  const near = bfsDistance(w, h, (x, y) => laid[x + y * w] === 1);
  return extracted.filter((river) => {
    const covered = river.points.filter((p) => (near[cellOfPoint(p, w, h)] as number) <= reach).length;
    return covered / river.points.length < SHADOW_FRACTION;
  });
}

/** An orphaned tributary, one whose trunk was dropped as a double, is left ending on dry land: drop it, repeatedly, until none is. A river's end on or next to a cell of a laid river, or a point of another kept river other than that river's last, stands. */
function dropOrphans(kept: ReadonlyArray<River>, laid: Uint8Array, elev: Field, seaLevel: number): River[] {
  const { w, h } = elev;
  let rivers = [...kept];
  for (;;) {
    const owners = new Map<number, Set<number>>();
    rivers.forEach((river, i) => {
      for (const p of river.points.slice(0, -1)) {
        const cell = cellOfPoint(p, w, h);
        const set = owners.get(cell) ?? new Set<number>();
        set.add(i);
        owners.set(cell, set);
      }
    });
    const meetsOther = (cell: number, self: number): boolean =>
      laid[cell] === 1 || [...(owners.get(cell) ?? [])].some((i) => i !== self);
    const next = rivers.filter((river, i) => {
      const end = river.points[river.points.length - 1] as RiverPoint;
      const cell = cellOfPoint(end, w, h);
      if ((elev.data[cell] as number) <= seaLevel || onBorder(cell, w, h)) return true;
      const x = cell % w;
      const y = (cell / w) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && meetsOther(nx + ny * w, i)) return true;
        }
      }
      return false;
    });
    if (next.length === rivers.length) return next;
    rivers = next;
  }
}

/** Lay one run: its cheapest path over the ground, then, for a run that ends inside the window, a walk down the region's own flow to water, a cell an earlier run laid, or the border. */
function layRun(run: RiverRun, ctx: LayContext): River {
  const { elev, flow, seaLevel, relief, radius, laid, density, reach } = ctx;
  const path = routeRun(run, { elev, seaLevel, relief, radius, laid });
  const points = pointsAlong(path, run, density, elev.w);
  const { w, h } = elev;
  const walked = run.leavesAtEdge
    ? points
    : extendMouthToWater(points, elev, flow, seaLevel, reach, (cell) => laid[cell] === 1 || onBorder(cell, w, h));
  return { points: walked, endsInOcean: run.endsInOcean };
}

type LayContext = RiverGround & {
  readonly relief: Field;
  readonly radius: number;
  readonly laid: Uint8Array;
  readonly density: number;
  readonly reach: number;
};

/** A cropped window loses upstream drainage, and NO threshold exponent restores it (missing area, not miscalibration): so every world river crossing the window is laid along the window's own ground, and the close-up's own extraction keeps only what neither doubles a laid river nor is left ending on dry land. */
export function layRegionRivers(world: World, window: UvWindow, land: RiverGround): RegionRivers {
  const { elev, seaLevel } = land;
  const { w, h } = elev;
  const radius = corridorRadius(window, w, world.recipe.gridW);
  const ctx: LayContext = {
    ...land,
    relief: fineRelief(land.ground, radius),
    radius,
    laid: new Uint8Array(w * h),
    density: regionDensityRatio(world.recipe.gridW, world.recipe.gridH, window, w, h),
    reach: mouthReachCells(w, window, world.recipe.gridW),
  };
  const laid: River[] = [];
  for (const run of worldRiverRuns(world, window, w, h)) {
    if (!hasLandUnder(run, elev, seaLevel)) continue;
    const river = layRun(run, ctx);
    for (const p of river.points) ctx.laid[cellOfPoint(p, w, h)] = 1;
    laid.push(river);
  }
  const extracted = extractRivers(elev, land.flow, seaLevel, {
    absoluteThreshold: regionRiverThreshold(world, window, w, h),
  });
  const doubleReach = Math.max(DOUBLE_REACH_FLOOR, Math.round(radius));
  return { laid, extracted: dropOrphans(unshadowed(extracted, ctx.laid, doubleReach, w, h), ctx.laid, elev, seaLevel) };
}
