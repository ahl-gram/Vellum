/**
 * Transect sampling for the Prospects (#238): pure helpers that read the
 * SAME heightfield the chart draws (world.elev) along lines in grid space.
 * Grid coordinates are x east, y south (see Winds in world/types.ts).
 *
 * Determinism contract: only +,-,*,/ and Math.sqrt are used, all IEEE-exact,
 * so sampled values are bit-identical wherever world.elev is. Math.hypot and
 * Math.atan2 are NOT correctly rounded and must not creep in here; a 1-ULP
 * drift would flip the pinned prospect checksums across platforms.
 */

import { type Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";

/** Unit view direction: from the viewer, through the site, toward the backdrop. */
export type ProspectView = {
  readonly dx: number;
  readonly dy: number;
};

/** Transect width: 64 cells, about 29 leagues at 2.2 cells per league. */
export const TRANSECT_HALF_WIDTH = 32;
/** Odd counts include an exact center sample at the transect midpoint. */
export const BACKDROP_SAMPLES = 129;
export const FOREGROUND_SAMPLES = 33;
/** The backdrop ridge line sits this many cells behind the site. */
export const BACKDROP_OFFSET = 12;
/** The foreground biome band sits this many cells toward the viewer. */
export const FOREGROUND_OFFSET = 2;
/** Stencil radius for the uphill gradient; wider than one cell so ridged
 * noise does not jitter the vantage. */
export const GRADIENT_RADIUS = 3;
/** Chebyshev radius searched for sea cells around a harbor site. */
export const SEA_SEARCH_RADIUS = 2;

/** Clamped bilinear read of a Field: positions past the border take the edge
 * value, so a transect near the world rim flattens rather than reading NaN. */
export function sampleBilinear(f: Field, x: number, y: number): number {
  const cx = clamp(x, 0, f.w - 1);
  const cy = clamp(y, 0, f.h - 1);
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(x0 + 1, f.w - 1);
  const y1 = Math.min(y0 + 1, f.h - 1);
  const tx = cx - x0;
  const ty = cy - y0;
  const top = f.at(x0, y0) * (1 - tx) + f.at(x1, y0) * tx;
  const bot = f.at(x0, y1) * (1 - tx) + f.at(x1, y1) * tx;
  return top * (1 - ty) + bot * ty;
}

/** The default vantage when nothing local dictates one: from the south,
 * looking north, the backdrop rising behind the site. */
const VIEW_FROM_SOUTH: ProspectView = { dx: 0, dy: -1 };

/** Flatten -0 to 0: JSON.stringify(-0) is "0", so a -0 component would break
 * the byte-identity contract on a serialize/parse round trip. */
const z = (v: number): number => (v === 0 ? 0 : v);

function normalize(dx: number, dy: number): ProspectView | null {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-12) return null;
  return { dx: z(dx / len), dy: z(dy / len) };
}

/** Mean direction from the site to nearby sea cells (elev <= seaLevel, the
 * same water test sites.ts uses to grant `harbor`). Null when no sea is in
 * reach or it surrounds the site symmetrically (an isthmus). */
function seawardDirection(
  elev: Field,
  seaLevel: number,
  x: number,
  y: number,
): ProspectView | null {
  let sx = 0;
  let sy = 0;
  for (let oy = -SEA_SEARCH_RADIUS; oy <= SEA_SEARCH_RADIUS; oy++) {
    for (let ox = -SEA_SEARCH_RADIUS; ox <= SEA_SEARCH_RADIUS; ox++) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (!elev.inBounds(nx, ny)) continue;
      if (elev.at(nx, ny) <= seaLevel) {
        sx += ox;
        sy += oy;
      }
    }
  }
  return normalize(sx, sy);
}

/** Uphill direction by central differences over a GRADIENT_RADIUS stencil.
 * Null on flat ground. */
function uphillDirection(elev: Field, x: number, y: number): ProspectView | null {
  const r = GRADIENT_RADIUS;
  const gx = sampleBilinear(elev, x + r, y) - sampleBilinear(elev, x - r, y);
  const gy = sampleBilinear(elev, x, y + r) - sampleBilinear(elev, x, y - r);
  return normalize(gx, gy);
}

/**
 * The adaptive vantage (#238, ratified 2026-08-09): a harbor is viewed from
 * the sea, an inland site from downslope looking uphill, and flat or
 * ambiguous ground from the south. Unit vector from viewer through site
 * toward the backdrop.
 */
export function viewDirection(
  elev: Field,
  seaLevel: number,
  site: { readonly x: number; readonly y: number; readonly harbor: boolean },
): ProspectView {
  if (site.harbor) {
    const sea = seawardDirection(elev, seaLevel, site.x, site.y);
    if (sea) return { dx: z(-sea.dx), dy: z(-sea.dy) };
  }
  return uphillDirection(elev, site.x, site.y) ?? VIEW_FROM_SOUTH;
}

/** The plate's left-to-right axis: the view direction rotated a quarter turn
 * clockwise in y-south grid space (a viewer facing north reads west to east). */
export function viewRight(view: ProspectView): ProspectView {
  return { dx: -view.dy, dy: view.dx };
}

/** `count` evenly spaced points along `dir` through (cx, cy), spanning
 * [-halfWidth, +halfWidth]. Odd counts land one sample exactly on center. */
export function linePoints(
  cx: number,
  cy: number,
  dir: ProspectView,
  halfWidth: number,
  count: number,
): ReadonlyArray<{ readonly x: number; readonly y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : -1 + (2 * i) / (count - 1);
    pts.push({
      x: cx + t * halfWidth * dir.dx,
      y: cy + t * halfWidth * dir.dy,
    });
  }
  return pts;
}
