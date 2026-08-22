import { createField, type Field } from "../core/grid.ts";
import { lerp, smoothstep } from "../core/math.ts";
import { fbm2, ridged2, warped2, OCTAVE_OFFSETS } from "../noise/fbm.ts";

export type MapType = "island" | "archipelago" | "continent" | "citystate";

export type UvWindow = {
  readonly u0: number;
  readonly v0: number;
  readonly u1: number;
  readonly v1: number;
};

export type TerrainParams = {
  readonly seed: number;
  readonly gridW: number;
  readonly gridH: number;
  readonly mapType: MapType;
  readonly featureScale?: number;
  readonly warpStrength?: number;
  readonly ridgedWeight?: number;
  /** Wobbles the radial falloff by direction so the coast forms lobes and peninsulas instead of an oval. Range [0, 1]; 0 is the pure radial dome; omitted takes the map type's SHAPES value. */
  readonly coastWarp?: number;
  /** Extra fBm octaves for a finer survey window, keyed off the window size by the caller; default 0, the world chart's density (#396). */
  readonly detail?: number;
  readonly window?: UvWindow;
  readonly worldAspect?: number;
};

type Shape = {
  featureScale: number;
  warpStrength: number;
  ridgedWeight: number;
  falloffStart: number;
  falloffEnd: number;
  baseKeep: number;
  sinkDepth: number;
  coastWarp: number;
};

const SHAPES: Record<MapType, Shape> = {
  island: {
    featureScale: 3.0,
    warpStrength: 0.45,
    ridgedWeight: 0.4,
    falloffStart: 0.62,
    falloffEnd: 1.02,
    baseKeep: 0.4,
    sinkDepth: 0.3,
    coastWarp: 0.55,
  },
  archipelago: {
    featureScale: 4.6,
    warpStrength: 0.7,
    ridgedWeight: 0.25,
    falloffStart: 0.55,
    falloffEnd: 1.05,
    baseKeep: 0.55,
    sinkDepth: 0.22,
    coastWarp: 0.55,
  },
  continent: {
    featureScale: 2.2,
    warpStrength: 0.4,
    ridgedWeight: 0.45,
    falloffStart: 0.78,
    falloffEnd: 1.12,
    baseKeep: 0.55,
    sinkDepth: 0.25,
    coastWarp: 0.55,
  },
  citystate: {
    featureScale: 2.6,
    warpStrength: 0.4,
    ridgedWeight: 0.3,
    falloffStart: 0.5,
    falloffEnd: 0.92,
    baseKeep: 0.36,
    sinkDepth: 0.34,
    coastWarp: 0.55,
  },
};

const RIDGE_SEED_SALT = 0x7fe9b2c5;
const COAST_SEED_SALT_X = 0x3c6ef35f;
const COAST_SEED_SALT_Y = 0x1b56c4e9;
const COAST_WARP_SCALE = 4.0;
const COAST_WARP_OCTAVES = 5;
const BASE_FBM_OCTAVES = 6;
export const MAX_DETAIL = OCTAVE_OFFSETS.length - BASE_FBM_OCTAVES;

/** Elevation is a pure function of world-space (u, v) and the seed, so a finer grid over the same recipe samples the identical landscape. */
export function buildHeightfield(params: TerrainParams): Field {
  const { seed, gridW, gridH, mapType } = params;
  const shape = SHAPES[mapType];
  const featureScale = params.featureScale ?? shape.featureScale;
  const warpStrength = params.warpStrength ?? shape.warpStrength;
  const ridgedWeight = params.ridgedWeight ?? shape.ridgedWeight;
  const coastWarp = params.coastWarp ?? shape.coastWarp;
  const detail = params.detail ?? 0;
  if (!Number.isInteger(detail) || detail < 0 || detail > MAX_DETAIL) {
    throw new RangeError(`detail must be an integer in [0, ${MAX_DETAIL}], got ${detail}`);
  }
  const aspect = params.worldAspect ?? (gridW - 1) / (gridH - 1);
  const win = params.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };

  return createField(gridW, gridH, (x, y) => {
    const u = win.u0 + (x / (gridW - 1)) * (win.u1 - win.u0);
    const v = win.v0 + (y / (gridH - 1)) * (win.v1 - win.v0);
    const nx = u * featureScale * aspect;
    const ny = v * featureScale;

    const base = warped2(nx, ny, seed, {
      octaves: BASE_FBM_OCTAVES + detail,
      normOctaves: BASE_FBM_OCTAVES,
      warpStrength,
    });
    const e01 = (base + 1) / 2;

    const ridge = ridged2(
      nx * 1.8 + 31.4,
      ny * 1.8 + 27.2,
      (seed ^ RIDGE_SEED_SALT) >>> 0,
      { octaves: 5 },
    );
    const ridgeMask = smoothstep(0.52, 0.78, e01);
    let e = e01 + ridgedWeight * ridge * ridgeMask;

    const dx = (u - 0.5) * 2;
    const dy = (v - 0.5) * 2;
    let d = Math.hypot(dx, dy);
    // The displacement stays bounded inside the deep-water border guarantee below, so land never clips the frame.
    if (coastWarp !== 0) {
      const wx = fbm2(
        u * COAST_WARP_SCALE * aspect,
        v * COAST_WARP_SCALE,
        (seed ^ COAST_SEED_SALT_X) >>> 0,
        { octaves: COAST_WARP_OCTAVES + detail, normOctaves: COAST_WARP_OCTAVES },
      );
      const wy = fbm2(
        u * COAST_WARP_SCALE * aspect + 41.7,
        v * COAST_WARP_SCALE + 17.3,
        (seed ^ COAST_SEED_SALT_Y) >>> 0,
        { octaves: COAST_WARP_OCTAVES + detail, normOctaves: COAST_WARP_OCTAVES },
      );
      d = Math.hypot(dx + coastWarp * wx, dy + coastWarp * wy);
    }
    const falloff = 1 - smoothstep(shape.falloffStart, shape.falloffEnd, d);
    e = e * lerp(shape.baseKeep, 1, falloff) - (1 - falloff) * shape.sinkDepth;

    // hard guarantee: outermost fringe is always deep water
    const edge = Math.min(u, 1 - u, v, 1 - v);
    e -= (1 - smoothstep(0, 0.05, edge)) * 0.8;

    return e;
  });
}
