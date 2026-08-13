/** Reads the SAME heightfield the chart draws, in grid space: x east, y south (see Winds in world/types.ts). */

import { type Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";

export type ProspectView = {
  readonly dx: number;
  readonly dy: number;
};

export const TRANSECT_HALF_WIDTH = 32;
export const BACKDROP_SAMPLES = 129;
export const FOREGROUND_SAMPLES = 33;
export const BACKDROP_OFFSET = 12;
export const FOREGROUND_OFFSET = 2;
export const GRADIENT_RADIUS = 3;
export const SEA_SEARCH_RADIUS = 2;

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

const VIEW_FROM_SOUTH: ProspectView = { dx: 0, dy: -1 };

/** Flatten -0 to 0: JSON.stringify(-0) is "0", which would break the byte-identity round trip. */
const z = (v: number): number => (v === 0 ? 0 : v);

function normalize(dx: number, dy: number): ProspectView | null {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-12) return null;
  return { dx: z(dx / len), dy: z(dy / len) };
}

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

function uphillDirection(elev: Field, x: number, y: number): ProspectView | null {
  const r = GRADIENT_RADIUS;
  const gx = sampleBilinear(elev, x + r, y) - sampleBilinear(elev, x - r, y);
  const gy = sampleBilinear(elev, x, y + r) - sampleBilinear(elev, x, y - r);
  return normalize(gx, gy);
}

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

export function viewRight(view: ProspectView): ProspectView {
  return { dx: -view.dy, dy: view.dx };
}

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
