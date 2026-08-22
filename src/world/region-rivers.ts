import type { Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";
import type { FlowResult } from "../hydrology/flow.ts";
import {
  extractRivers,
  isMajorRiver,
  riverThreshold,
  type River,
  type RiverPoint,
} from "../hydrology/rivers.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { World } from "./types.ts";

const SHADOW_RADIUS = 2;

/** A policy cap, not a derived bound: past about this far the walk stops repairing a mouth and starts inventing a river, so a run needing further is left as the parent drew it (#443 records the ones that do). */
const MOUTH_REACH_PARENT_CELLS = 3;
const SHADOW_FRACTION = 0.5;

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

function projectWorldMajors(
  world: World,
  window: UvWindow,
  gridW: number,
  gridH: number,
  density: number,
): River[] {
  const Ww = world.recipe.gridW;
  const Wh = world.recipe.gridH;
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const runs: River[] = [];
  for (const river of world.rivers) {
    if (!isMajorRiver(river)) continue;
    let cur: River["points"][number][] = [];
    const flush = (endsInOcean: boolean): void => {
      if (cur.length >= 2) runs.push({ points: cur, endsInOcean });
      cur = [];
    };
    river.points.forEach((p, i) => {
      const u = p.x / (Ww - 1);
      const v = p.y / (Wh - 1);
      if (u >= window.u0 && u <= window.u1 && v >= window.v0 && v <= window.v1) {
        cur.push({
          x: clamp(((u - window.u0) / du) * (gridW - 1), 0, gridW - 1),
          y: clamp(((v - window.v0) / dv) * (gridH - 1), 0, gridH - 1),
          acc: p.acc * density,
        });
        if (i === river.points.length - 1) flush(river.endsInOcean);
      } else {
        flush(false);
      }
    });
    flush(false);
  }
  return runs;
}

/** A parent major's mouth is a parent SEA cell, and on a detailed region field that cell can be new land, leaving the river drawn short of the water (#399). The region's own drainage is where the water would actually go. */
export function extendMouthToWater(
  points: ReadonlyArray<RiverPoint>,
  elev: Field,
  flow: FlowResult,
  seaLevel: number,
  maxSteps: number,
): ReadonlyArray<RiverPoint> {
  const last = points[points.length - 1];
  if (last === undefined) return points;
  const w = elev.w;
  let cell = Math.round(last.x) + Math.round(last.y) * w;
  if ((elev.data[cell] as number) <= seaLevel) return points;

  const walked: RiverPoint[] = [];
  for (let step = 0; step < maxSteps; step++) {
    const next = flow.dir[cell] as number;
    if (next < 0) break;
    cell = next;
    walked.push({ x: cell % w, y: (cell / w) | 0, acc: last.acc });
    if ((elev.data[cell] as number) <= seaLevel) return [...points, ...walked];
  }
  return points;
}

/** A cropped window loses upstream drainage, and NO threshold exponent restores it (missing area, not miscalibration): so extract at a density-scaled absolute threshold, and lay the parent's major rivers in as the authoritative through-network. */
export function anchorRegionRivers(
  world: World,
  window: UvWindow,
  gridW: number,
  gridH: number,
  elev: Field,
  flow: FlowResult,
  seaLevel: number,
): River[] {
  const density = regionDensityRatio(
    world.recipe.gridW,
    world.recipe.gridH,
    window,
    gridW,
    gridH,
  );
  const absoluteThreshold = worldRiverThreshold(world) * density; // exponent 1 (see doc above)
  const extracted = extractRivers(elev, flow, seaLevel, { absoluteThreshold });

  const mouthReach = Math.ceil(
    (MOUTH_REACH_PARENT_CELLS * (gridW - 1)) /
      ((window.u1 - window.u0) * (world.recipe.gridW - 1)),
  );
  const projected = projectWorldMajors(world, window, gridW, gridH, density).map((river) =>
    river.endsInOcean
      ? {
          points: extendMouthToWater(river.points, elev, flow, seaLevel, mouthReach),
          endsInOcean: true,
        }
      : river,
  );
  if (projected.length === 0) return extracted;

  const shadow = new Set<number>();
  for (const river of projected) {
    for (const p of river.points) {
      const cx = Math.round(p.x);
      const cy = Math.round(p.y);
      for (let dy = -SHADOW_RADIUS; dy <= SHADOW_RADIUS; dy++) {
        for (let dx = -SHADOW_RADIUS; dx <= SHADOW_RADIUS; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) shadow.add(nx + ny * gridW);
        }
      }
    }
  }

  const newDetail = extracted.filter((river) => {
    let covered = 0;
    for (const p of river.points) {
      if (shadow.has(Math.round(p.x) + Math.round(p.y) * gridW)) covered++;
    }
    return covered / river.points.length < SHADOW_FRACTION;
  });

  return [...projected, ...newDetail];
}
