import type { Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";
import type { FlowResult } from "../hydrology/flow.ts";
import {
  extractRivers,
  isMajorRiver,
  riverThreshold,
  type River,
} from "../hydrology/rivers.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { World } from "./types.ts";

// Cover a projected major-river cell and its 2-cell neighbourhood, so a shadowing
// extracted river is recognised even where the two grids disagree by a cell or two.
const SHADOW_RADIUS = 2;
// Drop an extracted river when at least half its cells shadow a projected major:
// the major is authoritative there, and keeping both would ink the same river twice.
const SHADOW_FRACTION = 0.5;

/**
 * How many region cells cover one world cell's area of the window: the areal
 * density ratio. Flow accumulation counts (rain-weighted) upstream cells, so it
 * scales linearly with this ratio (#162), which is why the world river threshold
 * multiplies by it with the physical exponent 1.
 */
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

/** The parent world's river threshold, computed the way generateWorld did. */
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

/** The parent world's MAJOR rivers, split into their in-window runs and projected
 *  to region cells. Accumulation scales by the density ratio so the drawn stroke
 *  width matches the region's own re-derived rivers at this zoom. */
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
        // the true mouth reaches the sea only on the run that ends the river
        if (i === river.points.length - 1) flush(river.endsInOcean);
      } else {
        flush(false);
      }
    });
    flush(false);
  }
  return runs;
}

/**
 * Region rivers, anchored to the parent world (#162). A cropped window re-runs
 * flow on its own grid, so a river entering from outside loses all of its
 * upstream drainage area and would vanish; the empirical cross-band test found NO
 * threshold exponent that restores it (missing area, not miscalibration). Two
 * additive fixes, then, and they cover different failure modes:
 *  - extract at a density-scaled ABSOLUTE threshold (exponent 1) so interior
 *    streams do not over- or under-draw against a window-local quantile;
 *  - lay the parent world's MAJOR rivers in as the authoritative through-network
 *    so named world rivers never vanish at the boundary.
 * Extracted rivers that shadow a projected major are dropped, so no river is
 * inked twice; the rest are the genuinely new finer detail the zoom reveals.
 */
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

  const projected = projectWorldMajors(world, window, gridW, gridH, density);
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
