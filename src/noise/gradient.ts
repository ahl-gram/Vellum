/**
 * Hash-lattice gradient noise (Perlin-style) over an infinite 2D domain.
 * No permutation table: corner gradients come from a mixed integer hash of
 * (ix, iy, seed), so the field is fully determined by the seed.
 */

import { lerp } from "../core/math.ts";

const TAU = Math.PI * 2;

function hash2(ix: number, iy: number, seed: number): number {
  let h = (seed ^ Math.imul(ix, 0x27d4eb2f) ^ Math.imul(iy, 0x9e3779b1)) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function cornerDot(
  cx: number,
  cy: number,
  dx: number,
  dy: number,
  seed: number,
): number {
  const angle = (hash2(cx, cy, seed) / 4294967296) * TAU;
  return Math.cos(angle) * dx + Math.sin(angle) * dy;
}

/** Returns ~[-1, 1]; exactly 0 at integer lattice points. */
export function gradientNoise2(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const d00 = cornerDot(ix, iy, fx, fy, seed);
  const d10 = cornerDot(ix + 1, iy, fx - 1, fy, seed);
  const d01 = cornerDot(ix, iy + 1, fx, fy - 1, seed);
  const d11 = cornerDot(ix + 1, iy + 1, fx - 1, fy - 1, seed);

  const u = fade(fx);
  const v = fade(fy);
  // bilinear: lerp along the top and bottom edges, then between the two
  return lerp(lerp(d00, d10, u), lerp(d01, d11, u), v) * Math.SQRT2;
}
