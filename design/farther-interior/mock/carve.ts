// Issue #950 round, river arm B, carve: every world river crossing the window (majors and minors) is cut into the close-up's ground before its water is worked out, so the close-up's own drainage finds it, and every layer downstream of the ground (climate, biomes, roads, towns' seats) is worked out on the carved ground by the forked pipeline (region-copy.ts).
// The carve alone finds nothing from band 4 down: a close-up that deep holds less upstream ground than the world's river threshold scaled to it, so the arm also FEEDS IN the world's own flow where each river enters (or rises), and OPENS AN OUTLET where it leaves the window. Both go through the inputs of the engine's `computeFlow` and `extractRivers`, which run unedited.
import { fieldFrom, type Field } from "../../../src/core/grid.ts";
import { computeFlow } from "../../../src/hydrology/flow.ts";
import { extractRivers, type River } from "../../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { bareDetail, cellOf, corridorOf, corridorRadius, fineRelief, type Corridor } from "./corridor.ts";
import { densify, densityOf, polylineLength, worldRiverThreshold, worldRuns, type Run } from "./course.ts";
import type { RegionHooks, WatersInput } from "./hooks.ts";

// STAND-IN, not ruled: the carve's shape. Inside a world cell either side of each world river's course the ground is lowered, never raised, to a valley: its floor follows the lowest ground across the corridor, step by step along the world's line, made never to rise downstream; its walls rise with the square of the distance from the line until they meet the ground at the corridor's edge; and the window's own fine detail (`bareDetail` in corridor.ts) is laid over the floor at MEANDER of the walls' height, so the lowest line, where the water runs, wanders inside the valley where that detail leads it rather than following the world's straight chords.
export const MEANDER = 0.12;
// STAND-IN: how far the floor is let down below the ground on the world's line, in units of that detail's spread.
export const FLOOR_MARGIN = 0.5;
// The carve never takes land below the waterline plus this, so no cell the world charts as land is ever drawn as water.
export const CARVE_FLOOR = 1e-4;

/** Each run's floor: the lowest ground across the corridor at each step along the course, made never to rise from source to mouth, against the fraction of the way along. Taken across the whole corridor, not on the world's line alone, or water at the line runs out of the valley wherever the ground beside it is lower (seen at the round's first try, seed 42 at Won, band 5). */
function runProfiles(field: Field, runs: ReadonlyArray<Run>, corridor: Corridor): Array<{ fracs: number[]; vals: number[] }> {
  return runs.map((run, ri) => {
    const bins = Math.max(8, Math.ceil(polylineLength(run.pts)));
    const low = new Array<number>(bins).fill(Infinity);
    for (let c = 0; c < field.data.length; c++) {
      if (corridor.run[c] !== ri) continue;
      const b = Math.min(bins - 1, Math.floor((corridor.along[c] as number) * bins));
      low[b] = Math.min(low[b]!, field.data[c] as number);
    }
    let run_ = Infinity;
    const vals = low.map((v) => (run_ = Math.min(run_, Number.isFinite(v) ? v : run_)));
    const first = vals.find((v) => Number.isFinite(v)) ?? 0;
    return { fracs: vals.map((_, i) => (i + 0.5) / bins), vals: vals.map((v) => (Number.isFinite(v) ? v : first)) };
  });
}

function profileAt(p: { fracs: number[]; vals: number[] }, s: number): number {
  let lo = 0;
  let hi = p.fracs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((p.fracs[mid] as number) <= s) lo = mid;
    else hi = mid;
  }
  const f0 = p.fracs[lo] as number;
  const f1 = p.fracs[hi] as number;
  const t = f1 > f0 ? Math.max(0, Math.min(1, (s - f0) / (f1 - f0))) : 0;
  return (p.vals[lo] as number) + ((p.vals[hi] as number) - (p.vals[lo] as number)) * t;
}

export function carveFor(world: World): (field: Field, window: UvWindow) => Field {
  return (field, window) => {
    const runs = worldRuns(world, window);
    if (runs.length === 0) return field;
    const R = corridorRadius(world, window);
    const corridor = corridorOf(runs, field.w, field.h, R);
    const detail = fineRelief(bareDetail(world, window, field.w, field.h), R);
    const profiles = runProfiles(field, runs, corridor);
    let n = 0;
    let s2 = 0;
    let wall = 0;
    for (let c = 0; c < field.data.length; c++) {
      const ri = corridor.run[c] as number;
      if (ri < 0 || (field.data[c] as number) <= world.seaLevel) continue;
      const r = detail.data[c] as number;
      s2 += r * r;
      n++;
      wall = Math.max(wall, (field.data[c] as number) - profileAt(profiles[ri]!, corridor.along[c] as number));
    }
    const spread = Math.sqrt(s2 / Math.max(1, n)) || 1e-12;
    const data = Float64Array.from(field.data);
    for (let c = 0; c < data.length; c++) {
      const ri = corridor.run[c] as number;
      const e = data[c] as number;
      if (ri < 0 || e <= world.seaLevel) continue;
      const d = (corridor.dist[c] as number) / R;
      const base = profileAt(profiles[ri]!, corridor.along[c] as number) - FLOOR_MARGIN * spread;
      const target = base + wall * (d * d + (MEANDER * (detail.data[c] as number)) / (2 * spread));
      const floor = Math.min(e, world.seaLevel + CARVE_FLOOR);
      data[c] = Math.max(floor, Math.min(e, target));
    }
    return fieldFrom(field.w, field.h, data);
  };
}

export type BWaters = { flow: ReturnType<typeof computeFlow>; rivers: River[]; outlets: number[]; fed: number[] };

/** The water stage with the world's inflow fed in and outlets opened; `computeFlow` and `extractRivers` themselves run as the engine has them. */
export function carvedWaters(input: WatersInput, opts: { readonly feed: boolean; readonly outlet: boolean } = { feed: true, outlet: true }): BWaters {
  const { world, window, gridW, gridH, elev, seaLevel, rain } = input;
  const runs = worldRuns(world, window);
  const fedRain = Float64Array.from(rain);
  const flowElev = Float64Array.from(elev.data);
  const isLand = (c: number): boolean => (elev.data[c] as number) > seaLevel;
  const outlets: number[] = [];
  const fed: number[] = [];
  for (const run of runs) {
    const course = densify(run.pts);
    let k = 0;
    while (k < course.length - 1 && !isLand(cellOf(course[k]!, gridW, gridH))) k++;
    const entry = cellOf(course[k]!, gridW, gridH);
    if (opts.feed && isLand(entry)) {
      fedRain[entry] = (fedRain[entry] as number) + (run.acc[0] as number);
      fed.push(entry);
    }
    if (opts.outlet && run.leavesAtEdge) {
      const exit = cellOf(run.pts[run.pts.length - 1]!, gridW, gridH);
      if (isLand(exit)) {
        flowElev[exit] = seaLevel - 1e-6;
        outlets.push(exit);
      }
    }
  }
  const flowField = fieldFrom(gridW, gridH, flowElev);
  const flow = computeFlow(flowField, seaLevel, fedRain);
  const threshold = worldRiverThreshold(world) * densityOf(world, window);
  const outletSet = new Set(outlets);
  const rivers = extractRivers(flowField, flow, seaLevel, { absoluteThreshold: threshold }).map((r) => {
    const last = r.points[r.points.length - 1]!;
    return outletSet.has(Math.round(last.x) + Math.round(last.y) * gridW) ? { ...r, endsInOcean: false } : r;
  });
  return { flow, rivers, outlets, fed };
}

export type CarveMode = "after" | "inside";

/** Arm B as drawn is all three parts on; the measurements also run it with a part off, to show what each part does. Every variant lays in no projected world river: its rivers are the close-up's own extraction. */
export function armBHooks(world: World, mode: CarveMode, opts: { readonly carve?: boolean; readonly feed?: boolean; readonly outlet?: boolean } = {}): RegionHooks {
  const carve = carveFor(world);
  const parts = { feed: opts.feed !== false, outlet: opts.outlet !== false };
  const waters = (i: WatersInput): { flow: BWaters["flow"]; rivers: River[] } => carvedWaters(i, parts);
  if (opts.carve === false) return { waters };
  return mode === "after" ? { waters, carve } : { waters, chainCarve: { fn: carve, key: "carve-b1" } };
}
