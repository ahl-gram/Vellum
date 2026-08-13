import type { Point } from "../terrain/contours.ts";
import {
  chaikinSmooth,
  chaikinSmoothPinned,
  closedIsoRings,
} from "../terrain/contours.ts";
import type { World } from "../world/types.ts";

/** 1e-3 clears the isoline crossT clamp jitter (1e-6) while staying far below the one-cell spacing an interior crossing keeps from the edge. */
const FRAME_EPS = 1e-3;

export function coastRingsGrid(world: World, coastIters: number): Point[][] {
  const rings = closedIsoRings(world.elev, world.seaLevel);
  if (world.region === undefined) {
    return rings.map((c) => chaikinSmooth(c.points, true, coastIters));
  }
  const onFrame = frameVertexPredicate(world.elev.w, world.elev.h);
  return rings.map((c) => chaikinSmoothPinned(c.points, coastIters, onFrame));
}

function frameVertexPredicate(w: number, h: number): (p: Point) => boolean {
  const gw = w - 1;
  const gh = h - 1;
  return (p: Point): boolean =>
    p[0] <= FRAME_EPS ||
    p[0] >= gw - FRAME_EPS ||
    p[1] <= FRAME_EPS ||
    p[1] >= gh - FRAME_EPS;
}
