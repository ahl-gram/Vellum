import type { Point } from "../terrain/contours.ts";
import { chaikinSmooth, chaikinSmoothPinned, filledIsoRings } from "../terrain/contours.ts";
import type { World } from "../world/types.ts";

/** 1e-3 clears the isoline crossT clamp jitter (1e-6) while staying far below the one-cell spacing an interior crossing keeps from the edge. */
const FRAME_EPS = 1e-3;

export function coastRingsGrid(world: World, coastIters: number): Array<ReadonlyArray<Point>> {
  const { elev, seaLevel } = world;
  if (world.region === undefined) {
    return filledIsoRings(elev, seaLevel, (p) => chaikinSmooth(p, true, coastIters));
  }
  const onFrame = frameVertexPredicate(elev.w, elev.h);
  return filledIsoRings(elev, seaLevel, (p) => chaikinSmoothPinned(p, coastIters, onFrame));
}

export function frameVertexPredicate(w: number, h: number): (p: Point) => boolean {
  const gw = w - 1;
  const gh = h - 1;
  return (p: Point): boolean =>
    p[0] <= FRAME_EPS || p[0] >= gw - FRAME_EPS || p[1] <= FRAME_EPS || p[1] >= gh - FRAME_EPS;
}
