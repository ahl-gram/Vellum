import type { Point } from "../terrain/contours.ts";
import {
  chaikinSmooth,
  chaikinSmoothPinned,
  closedIsoRings,
} from "../terrain/contours.ts";
import type { World } from "../world/types.ts";

/**
 * Distance (in grid units) within which a coast vertex counts as sitting on the
 * window frame. Marching-squares boundary crossings and the inserted rect
 * corners land EXACTLY on 0 / W / 0 / H, and the isoline crossT is clamped to
 * [1e-6, 1 - 1e-6], so 1e-3 clears that jitter with room to spare while staying
 * far below the one-cell spacing an interior crossing keeps from the edge.
 */
const FRAME_EPS = 1e-3;

/**
 * Coastline rings in GRID space, corner-cut and ready to project.
 *
 * On a standalone world chart the whole ring is a real shore, so it gets the
 * plain width-scaled smooth (byte-identical to the historical inline call, which
 * keeps the committed goldens pinned). On a regional survey the coast is closed
 * against the zoom-window rectangle, so the ring mixes real shore with straight
 * frame edges and hard 90 degree frame corners; there we pin the frame vertices
 * (`chaikinSmoothPinned`) so corner-cutting rounds only the true coast. Without
 * the pin, Chaikin rounds each frame corner ~1/4 edge inward every pass, carving
 * real land back over the solid ocean rect painted behind it (the "phantom sea"
 * of #223). The frame stays sharp; the shore still reads as drawn.
 */
export function coastRingsGrid(world: World, coastIters: number): Point[][] {
  const rings = closedIsoRings(world.elev, world.seaLevel);
  if (world.region === undefined) {
    return rings.map((c) => chaikinSmooth(c.points, true, coastIters));
  }
  const onFrame = frameVertexPredicate(world.elev.w, world.elev.h);
  return rings.map((c) => chaikinSmoothPinned(c.points, coastIters, onFrame));
}

/** True for coast vertices lying on the window frame (x=0/W or y=0/H). */
function frameVertexPredicate(w: number, h: number): (p: Point) => boolean {
  const gw = w - 1;
  const gh = h - 1;
  return (p: Point): boolean =>
    p[0] <= FRAME_EPS ||
    p[0] >= gw - FRAME_EPS ||
    p[1] <= FRAME_EPS ||
    p[1] >= gh - FRAME_EPS;
}
