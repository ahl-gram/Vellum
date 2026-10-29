import { createField, type Field } from "../core/grid.ts";
import { lerp, smoothstep } from "../core/math.ts";
import { fbm2, ridged2, warped2, OCTAVE_OFFSETS } from "../noise/fbm.ts";
import { isOutlineId, type OutlineId } from "../world/outline-ids.ts";
import { outlineSegments, signedDistance, type OutlineSegments } from "./outline-distance.ts";
import type { IsleSize } from "./lobes.ts";

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
  readonly outline?: OutlineId;
  readonly looseness?: number;
  readonly islands?: number;
  readonly isleSize?: IsleSize;
  readonly raggedness?: number;
  /** Extra fBm octaves for a finer survey window, keyed off the window size by the caller; default 0, the world chart's density (Issue #396). */
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

type TerrainSettings = {
  readonly seed: number;
  readonly shape: Shape;
  readonly featureScale: number;
  readonly warpStrength: number;
  readonly ridgedWeight: number;
  readonly coastWarp: number;
  readonly detail: number;
  readonly aspect: number;
  readonly outline: OutlineSegments | undefined;
  readonly looseness: number;
};

export function isLooseness(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function outlineOf(params: TerrainParams, aspect: number): { outline: OutlineSegments | undefined; looseness: number } {
  const looseness = params.looseness ?? 0;
  if (!isLooseness(looseness)) throw new RangeError(`looseness must be a number in [0, 1], got ${looseness}`);
  if (params.outline === undefined) {
    if (params.looseness !== undefined) throw new RangeError("looseness needs an outline");
    return { outline: undefined, looseness };
  }
  if (!isOutlineId(params.outline)) throw new RangeError(`unknown outline ${String(params.outline)}`);
  return { outline: outlineSegments(params.outline, aspect), looseness };
}

function terrainSettings(params: TerrainParams): TerrainSettings {
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
  if (!Number.isFinite(coastWarp)) {
    throw new RangeError(`coastWarp must be a finite number, got ${coastWarp}`);
  }
  const aspect = params.worldAspect ?? (gridW - 1) / (gridH - 1);
  return {
    seed,
    shape,
    featureScale,
    warpStrength,
    ridgedWeight,
    coastWarp,
    detail,
    aspect,
    ...outlineOf(params, aspect),
  };
}

type Warp = readonly [number, number];

function coastWarpAt(u: number, v: number, s: TerrainSettings): Warp {
  const { seed, detail, aspect } = s;
  const wx = fbm2(u * COAST_WARP_SCALE * aspect, v * COAST_WARP_SCALE, (seed ^ COAST_SEED_SALT_X) >>> 0, {
    octaves: COAST_WARP_OCTAVES + detail,
    normOctaves: COAST_WARP_OCTAVES,
  });
  const wy = fbm2(u * COAST_WARP_SCALE * aspect + 41.7, v * COAST_WARP_SCALE + 17.3, (seed ^ COAST_SEED_SALT_Y) >>> 0, {
    octaves: COAST_WARP_OCTAVES + detail,
    normOctaves: COAST_WARP_OCTAVES,
  });
  return [wx, wy];
}

function domeDistance(u: number, v: number, coastWarp: number, warp: Warp | null): number {
  const dx = (u - 0.5) * 2;
  const dy = (v - 0.5) * 2;
  return warp === null ? Math.hypot(dx, dy) : Math.hypot(dx + coastWarp * warp[0], dy + coastWarp * warp[1]);
}

function coastDistance(u: number, v: number, s: TerrainSettings): number {
  return domeDistance(u, v, s.coastWarp, s.coastWarp !== 0 ? coastWarpAt(u, v, s) : null);
}

const SOFT_END = 2 / 3;
const NUDGE = 0.65;
const SHELF_TOP = 0.05;
const SHELF_DEPTH = 0.3;
const SHELF_WIDTH = 0.1;

export function looseningOf(looseness: number): number {
  return Math.max(0, (looseness - SOFT_END) / (1 - SOFT_END));
}

function shapedElevation(e: number, u: number, v: number, s: TerrainSettings, outline: OutlineSegments): number {
  const { shape, coastWarp, looseness } = s;
  const soft = Math.min(1, looseness / SOFT_END);
  const soften = soft * soft;
  const loosen = looseningOf(looseness);
  const warp = coastWarp !== 0 && looseness > 0 ? coastWarpAt(u, v, s) : null;
  const du = warp === null ? 0 : (coastWarp * warp[0] * soften) / 2;
  const dv = warp === null ? 0 : (coastWarp * warp[1] * soften) / 2;
  const sd = signedDistance(outline, u + du, v + dv);
  const outlineD = shape.falloffStart + 2 * sd;
  const d = loosen > 0 ? lerp(outlineD, domeDistance(u, v, coastWarp, warp), NUDGE * loosen) : outlineD;
  const width = (shape.falloffEnd - shape.falloffStart) * soften;
  const falloff = width === 0 ? (sd < 0 ? 1 : 0) : 1 - smoothstep(shape.falloffStart, shape.falloffStart + width, d);
  const keep = shape.baseKeep * soften;
  const sink = lerp(SHELF_TOP + SHELF_DEPTH * smoothstep(0, SHELF_WIDTH, sd), shape.sinkDepth, soften);
  return e * lerp(keep, 1, falloff) - (1 - falloff) * sink;
}

function edgeSink(u: number, v: number): number {
  const edge = Math.min(u, 1 - u, v, 1 - v);
  return (1 - smoothstep(0, 0.05, edge)) * 0.8;
}

function elevationAt(u: number, v: number, s: TerrainSettings): number {
  const { seed, shape, featureScale, warpStrength, ridgedWeight, detail, aspect } = s;
  const nx = u * featureScale * aspect;
  const ny = v * featureScale;

  const base = warped2(nx, ny, seed, {
    octaves: BASE_FBM_OCTAVES + detail,
    normOctaves: BASE_FBM_OCTAVES,
    warpStrength,
  });
  const e01 = (base + 1) / 2;

  const ridge = ridged2(nx * 1.8 + 31.4, ny * 1.8 + 27.2, (seed ^ RIDGE_SEED_SALT) >>> 0, { octaves: 5 });
  const ridgeMask = smoothstep(0.52, 0.78, e01);
  let e = e01 + ridgedWeight * ridge * ridgeMask;

  if (s.outline !== undefined) return shapedElevation(e, u, v, s, s.outline) - edgeSink(u, v);

  const d = coastDistance(u, v, s);
  const falloff = 1 - smoothstep(shape.falloffStart, shape.falloffEnd, d);
  e = e * lerp(shape.baseKeep, 1, falloff) - (1 - falloff) * shape.sinkDepth;

  e -= edgeSink(u, v);

  return e;
}

export function buildHeightfield(params: TerrainParams): Field {
  const { gridW, gridH } = params;
  const settings = terrainSettings(params);
  const win = params.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };

  return createField(gridW, gridH, (x, y) => {
    const u = win.u0 + (x / (gridW - 1)) * (win.u1 - win.u0);
    const v = win.v0 + (y / (gridH - 1)) * (win.v1 - win.v0);
    return elevationAt(u, v, settings);
  });
}
