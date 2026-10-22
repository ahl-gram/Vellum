// Issue #950 round: the constants and small helpers every script of the round shares.
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { lodWindowFor, quantizeCenter } from "../../../src/world/lod.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";

// Where Alex looks: the main checkout's delivery folder. Every script writes there through this one constant.
export const DELIVERY = "/Users/ahl/CodeProjects/Vellum/out/950";
export const SHA = "cbf57b8f";
export const SEEDS = [42, 7, 2, 15, 23] as const;
// Every band the Glass reaches today keeps a 320 by 240 grid (`LOD_BANDS` in `src/world/lod.ts`), and a deeper window's ancestors fall back to the same grid (`gridForWindow` in `src/world/detail-chain.ts`).
export const GRID_W = 320;
export const GRID_H = 240;
// The Explorer's render: `widthPx: 1500` (`src/site/explorer/app.ts`), legend on, arms and beasts off by default (`src/pages/explorer/index.astro`).
export const RENDER_WIDTH = 1500;
export const THEMES = ["vegetation", "climate", "moisture", "population"] as const;
export type Theme = (typeof THEMES)[number];

export const sizeOf = (band: number): number => 1 / 2 ** band;

const worlds = new Map<number, World>();
export function worldOf(seed: number): World {
  let w = worlds.get(seed);
  if (w === undefined) {
    w = generateWorld(defaultRecipe(seed));
    worlds.set(seed, w);
  }
  return w;
}

/** The window the Glass commits for a camera centred at (cx, cy) in plot uv, at a band: the lattice-quantized centre and `lodWindowFor`, as `decideSettle` in `src/world/lod.ts` does. */
export function bandWindow(cx: number, cy: number, band: number): UvWindow {
  const size = sizeOf(band);
  const q = quantizeCenter(cx, cy, size);
  return lodWindowFor(q.cx, q.cy, size);
}

export const uvOf = (world: World, x: number, y: number): { u: number; v: number } => ({
  u: x / (world.recipe.gridW - 1),
  v: y / (world.recipe.gridH - 1),
});

/** World grid point to region grid coordinates (fractional), for a window. */
export function toRegion(world: World, w: UvWindow, x: number, y: number): { x: number; y: number } {
  const u = x / (world.recipe.gridW - 1);
  const v = y / (world.recipe.gridH - 1);
  return { x: ((u - w.u0) / (w.u1 - w.u0)) * (GRID_W - 1), y: ((v - w.v0) / (w.v1 - w.v0)) * (GRID_H - 1) };
}

/** Region cells per world cell across a window: 2 to the band, near enough (the inset is 319 over size times 319). */
export const cellsPerWorldCell = (w: UvWindow, world: World): number => (GRID_W - 1) / ((w.u1 - w.u0) * (world.recipe.gridW - 1));

export const winLabel = (w: UvWindow): string => `u ${w.u0.toFixed(5)} to ${w.u1.toFixed(5)}, v ${w.v0.toFixed(5)} to ${w.v1.toFixed(5)}`;

export function median(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
}

export function distToPolyline(px: number, py: number, pts: ReadonlyArray<{ x: number; y: number }>): number {
  if (pts.length === 1) return Math.hypot(px - pts[0]!.x, py - pts[0]!.y);
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2)) : 0;
    best = Math.min(best, Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy)));
  }
  return best;
}
