// Issue #950 round: the committed instruments, copied because none of them reaches bands 4 to 6 or an arm: `sweep.ts --bands=4` indexes a `LOD_BANDS` entry that does not exist, `riversEndingOnLand` and `massCoverage` in `scripts/region-detail/sweep-measure.ts` are module-private, and `scripts/region-detail/partition.ts` is a top-level script. Each copy is the committed function as it stands at the round's sha, and check-instruments.ts proves each reproduces the committed script's own count before it is turned on an arm.
import { labelLandmasses } from "../../../src/world/landmass.ts";
import { landSnapRadius } from "../../../src/world/snap-to-land.ts";
import type { River } from "../../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { GRID_H, GRID_W } from "./common.ts";

// `CONFLUENCE_TOL` and `riversEndingOnLand` in `scripts/region-detail/sweep-measure.ts`, verbatim.
const CONFLUENCE_TOL = 2;
export function riversEndingOnLand(region: World, rivers: ReadonlyArray<River>, tol: number): number[] {
  const { w, h } = region.elev;
  const cellsOf = (r: River): Set<number> => new Set(r.points.map((p) => Math.round(p.x) + Math.round(p.y) * w));
  const all = rivers.map(cellsOf);
  const nearAnother = (self: number, x: number, y: number): boolean => {
    for (let dy = -CONFLUENCE_TOL; dy <= CONFLUENCE_TOL; dy++) {
      for (let dx = -CONFLUENCE_TOL; dx <= CONFLUENCE_TOL; dx++) {
        const idx = x + dx + (y + dy) * w;
        for (let j = 0; j < all.length; j++) {
          if (j !== self && (all[j] as Set<number>).has(idx)) return true;
        }
      }
    }
    return false;
  };
  const bad: number[] = [];
  rivers.forEach((river, i) => {
    const last = river.points[river.points.length - 1];
    if (last === undefined) return;
    const x = Math.round(last.x);
    const y = Math.round(last.y);
    if (x <= tol || y <= tol || x >= w - 1 - tol || y >= h - 1 - tol) return;
    if ((region.elev.data[x + y * w] as number) <= region.seaLevel) return;
    if (nearAnother(i, x, y)) return;
    bad.push(i);
  });
  return bad;
}

/** The tolerance `measure` in `scripts/region-detail/sweep-measure.ts` passes. */
export const endingTol = (world: World, window: UvWindow): number => landSnapRadius(GRID_W, window, world.recipe.gridW) + 1;

// `worldCellUnder` in `scripts/region-detail/sweep-measure.ts`, verbatim.
export function worldCellUnder(world: World, window: UvWindow, gridW: number, gridH: number, gx: number, gy: number): number {
  const Ww = world.recipe.gridW;
  const u = window.u0 + (gx / (gridW - 1)) * (window.u1 - window.u0);
  const v = window.v0 + (gy / (gridH - 1)) * (window.v1 - window.v0);
  return Math.round(u * (Ww - 1)) + Math.round(v * (world.recipe.gridH - 1)) * Ww;
}

// `massCoverage` in `scripts/region-detail/sweep-measure.ts`, verbatim but for the world ids passed in (they cost a flood per call): the world's landmasses fused into one close-up landmass, lost from the window, and present in it. `census` in `scripts/region-detail/partition.ts` counts the same way.
export function massCoverage(world: World, worldIds: Int32Array, region: World, window: UvWindow): { fusedPairs: number; lost: number; inWindow: number } {
  const regionIds = labelLandmasses(region.elev, region.seaLevel).ids;
  const coveredBy = new Map<number, Set<number>>();
  const present = new Set<number>();
  const alive = new Set<number>();
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const wid = worldIds[worldCellUnder(world, window, GRID_W, GRID_H, gx, gy)] as number;
      const rid = regionIds[gx + gy * GRID_W] as number;
      if (wid < 0) continue;
      present.add(wid);
      if (rid < 0) continue;
      alive.add(wid);
      let s = coveredBy.get(rid);
      if (s === undefined) {
        s = new Set();
        coveredBy.set(rid, s);
      }
      s.add(wid);
    }
  }
  return { fusedPairs: [...coveredBy.values()].reduce((a, s) => a + Math.max(0, s.size - 1), 0), lost: present.size - alive.size, inWindow: present.size };
}

// `parentLandDrowned` of `parentLandTally` in `scripts/region-detail/sweep-measure.ts`: cells the world charts as land that the close-up draws as water.
export function parentLandDrowned(world: World, region: World, window: UvWindow): number {
  let n = 0;
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const wi = worldCellUnder(world, window, GRID_W, GRID_H, gx, gy);
      if ((world.elev.data[wi] as number) <= world.seaLevel) continue;
      if ((region.elev.data[gx + gy * GRID_W] as number) <= region.seaLevel) n++;
    }
  }
  return n;
}

// The breakdown's per-feature count (`tallyFeatures` in out/395-subs/measure-features.ts, the instrument behind Issue #950's own table): a world river or road crossing the window counts as drawn when at least half of its in-window course lies within max(3, one world cell) region cells of a drawn one. Here it hands back the flag per feature, so a feature can be followed from band to band.
type Pt = { readonly x: number; readonly y: number };

function clip(a: Pt, b: Pt, x0: number, y0: number, x1: number, y1: number): [Pt, Pt] | null {
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
  return [
    { x: a.x + t0 * dx, y: a.y + t0 * dy },
    { x: a.x + t1 * dx, y: a.y + t1 * dy },
  ];
}

export function inWindowSamples(points: ReadonlyArray<Pt>, world: World, w: UvWindow): Pt[] {
  const Ww = world.recipe.gridW - 1;
  const Wh = world.recipe.gridH - 1;
  const [x0, x1, y0, y1] = [w.u0 * Ww, w.u1 * Ww, w.v0 * Wh, w.v1 * Wh];
  const toRegion = (p: Pt): Pt => ({ x: ((p.x / Ww - w.u0) / (w.u1 - w.u0)) * (GRID_W - 1), y: ((p.y / Wh - w.v0) / (w.v1 - w.v0)) * (GRID_H - 1) });
  const out: Pt[] = [];
  for (let i = 1; i < points.length; i++) {
    const c = clip(points[i - 1]!, points[i]!, x0, y0, x1, y1);
    if (!c) continue;
    const a = toRegion(c[0]);
    const b = toRegion(c[1]);
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
    for (let k = 0; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}

function distTo(p: Pt, pts: ReadonlyArray<Pt>): number {
  if (pts.length === 1) return Math.hypot(p.x - pts[0]!.x, p.y - pts[0]!.y);
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
    best = Math.min(best, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)));
  }
  return best;
}

export const featureTolerance = (band: number): number => Math.max(3, 2 ** band);

/** Per world feature (by index): undefined when it does not cross the window, else whether the close-up draws it. */
export function featureDrawn(features: ReadonlyArray<ReadonlyArray<Pt>>, drawn: ReadonlyArray<ReadonlyArray<Pt>>, world: World, w: UvWindow, band: number): Array<boolean | undefined> {
  const tol = featureTolerance(band);
  return features.map((f) => {
    const s = inWindowSamples(f, world, w);
    if (s.length === 0) return undefined;
    const near = s.filter((p) => drawn.some((d) => distTo(p, d) <= tol)).length;
    return near / s.length >= 0.5;
  });
}

/** How far a drawn river lies from the world's line: over every point of a drawn river within the corridor of some world river crossing the window, its distance to the nearest world course, region cells. */
export function deviation(worldCourses: ReadonlyArray<ReadonlyArray<Pt>>, drawn: ReadonlyArray<ReadonlyArray<Pt>>, radius: number): { mean: number; max: number; n: number } {
  let sum = 0;
  let max = 0;
  let n = 0;
  for (const r of drawn) {
    for (const p of r) {
      let d = Infinity;
      for (const c of worldCourses) d = Math.min(d, distTo(p, c));
      if (d > radius * 1.5) continue;
      sum += d;
      max = Math.max(max, d);
      n++;
    }
  }
  return { mean: n > 0 ? sum / n : NaN, max, n };
}
