import { bfsDistance } from "../core/bfs-distance.ts";
import { createField, type Field } from "../core/grid.ts";
import { clamp, smoothstep } from "../core/math.ts";
import { fbm2 } from "../noise/fbm.ts";
import { computeWindMoisture } from "./moisture-wind.ts";

export type ClimateBand = "temperate" | "tropical" | "polar";

export type Climate = {
  readonly temperature: Field;
  readonly moisture: Field;
};

export type DryClimate = Climate & {
  readonly moistureSum: Field;
};

export type DryClimateOptions = {
  band?: ClimateBand;
  windDir: number;
  window?: { u0: number; v0: number; u1: number; v1: number };
  worldAspect?: number;
  elevSpan?: number;
};

export type ClimateOptions = DryClimateOptions & {
  riverCells?: Uint8Array;
};

const BANDS: Record<ClimateBand, { base: number; latSpan: number }> = {
  tropical: { base: 0.6, latSpan: 0.35 },
  temperate: { base: 0.32, latSpan: 0.5 },
  polar: { base: 0.05, latSpan: 0.42 },
};

const LAPSE = 0.85;
const TEMP_SEED_SALT = 0x1b873593;
const MOIST_SEED_SALT = 0xcc9e2d51;

type WindowMap = { readonly toU: (x: number) => number; readonly toV: (y: number) => number };

function windowMap(elev: Field, opts: DryClimateOptions): WindowMap {
  const { w, h } = elev;
  const win = opts.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };
  const toU = (x: number): number => win.u0 + (x / (w - 1)) * (win.u1 - win.u0);
  const toV = (y: number): number => win.v0 + (y / (h - 1)) * (win.v1 - win.v0);
  return { toU, toV };
}

function climateElevSpan(elev: Field, seaLevel: number, given: number | undefined): number {
  let span = given;
  if (span === undefined) {
    let maxElev = -Infinity;
    for (const v of elev.data) maxElev = Math.max(maxElev, v);
    span = maxElev - seaLevel;
  }
  return Math.max(1e-9, span);
}

type ClimateFrame = {
  readonly seaLevel: number;
  readonly seed: number;
  readonly aspect: number;
  readonly map: WindowMap;
};

function temperatureField(
  elev: Field,
  frame: ClimateFrame,
  band: { base: number; latSpan: number },
  elevSpan: number,
): Field {
  const { w, h, data } = elev;
  const { seaLevel, seed, aspect, map } = frame;
  const { toU, toV } = map;
  return createField(w, h, (x, y) => {
    const lat = toV(y); // south (high v) is warm
    const u = toU(x);
    const wobble =
      fbm2(u * 3 * aspect, lat * 3, (seed ^ TEMP_SEED_SALT) >>> 0, {
        octaves: 3,
      }) * 0.05;
    const e = data[x + y * w] as number;
    const above = Math.max(0, e - seaLevel) / elevSpan;
    return clamp(band.base + band.latSpan * lat + wobble - above * LAPSE, 0, 1);
  });
}

function moistureSumField(elev: Field, frame: ClimateFrame, windRain: Float64Array): Field {
  const { w, h } = elev;
  const { seed, aspect, map } = frame;
  const { toU, toV } = map;
  return createField(w, h, (x, y) => {
    const u = toU(x);
    const v = toV(y);
    const base =
      0.31 +
      fbm2(u * 4 * aspect + 13.7, v * 4 + 71.3, (seed ^ MOIST_SEED_SALT) >>> 0, {
        octaves: 4,
      }) *
        0.22;
    const i = x + y * w;
    const windBonus = 0.5 * (windRain[i] as number) - 0.06;
    return base + windBonus;
  });
}

function moistureField(moistureSum: Field, riverDist: Float64Array | null): Field {
  const { w, h, data } = moistureSum;
  return createField(w, h, (x, y) => {
    const i = x + y * w;
    const riverBonus = riverDist ? 0.3 * (1 - smoothstep(0, 6, riverDist[i] as number)) : 0;
    return clamp((data[i] as number) + riverBonus, 0, 1);
  });
}

export function computeDryClimate(elev: Field, seaLevel: number, seed: number, opts: DryClimateOptions): DryClimate {
  const { w, h } = elev;
  const band = BANDS[opts.band ?? "temperate"];
  const aspect = opts.worldAspect ?? (w - 1) / (h - 1);
  const frame: ClimateFrame = { seaLevel, seed, aspect, map: windowMap(elev, opts) };
  const elevSpan = climateElevSpan(elev, seaLevel, opts.elevSpan);

  const temperature = temperatureField(elev, frame, band, elevSpan);
  const windRain = computeWindMoisture(elev, seaLevel, opts.windDir, !opts.window);
  const moistureSum = moistureSumField(elev, frame, windRain);
  return { temperature, moisture: moistureField(moistureSum, null), moistureSum };
}

export function withRiverMoisture(dry: DryClimate, riverCells: Uint8Array): Climate {
  const { w, h } = dry.moistureSum;
  const riverDist = bfsDistance(w, h, (x, y) => riverCells[x + y * w] === 1);
  return { temperature: dry.temperature, moisture: moistureField(dry.moistureSum, riverDist) };
}

export function computeClimate(elev: Field, seaLevel: number, seed: number, opts: ClimateOptions): Climate {
  const dry = computeDryClimate(elev, seaLevel, seed, opts);
  return opts.riverCells
    ? withRiverMoisture(dry, opts.riverCells)
    : { temperature: dry.temperature, moisture: dry.moisture };
}

export function rainFrom(moisture: Field): Float64Array {
  const rain = new Float64Array(moisture.data.length);
  for (let i = 0; i < rain.length; i++) {
    rain[i] = 0.3 + 1.4 * (moisture.data[i] as number);
  }
  return rain;
}
