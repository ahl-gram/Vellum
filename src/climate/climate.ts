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

export type ClimateOptions = {
  band?: ClimateBand;
  riverCells?: Uint8Array;
  /** Prevailing wind in radians, blown toward (world.winds.dir). */
  windDir: number;
  /** World-space crop for regional charts (keeps latitude consistent). */
  window?: { u0: number; v0: number; u1: number; v1: number };
  worldAspect?: number;
  /**
   * Elevation span (maxElev - seaLevel) to normalize the lapse-rate against. A
   * regional survey (#162) passes the PARENT world's span so temperature and the
   * snow/alpine bands match the world chart at the window boundary; omitted, the
   * field's own local max is used (the world-chart default).
   */
  elevSpan?: number;
};

const BANDS: Record<ClimateBand, { base: number; latSpan: number }> = {
  tropical: { base: 0.6, latSpan: 0.35 },
  temperate: { base: 0.32, latSpan: 0.5 },
  polar: { base: 0.05, latSpan: 0.42 },
};

const LAPSE = 0.85;
const TEMP_SEED_SALT = 0x1b873593;
const MOIST_SEED_SALT = 0xcc9e2d51;

export function computeClimate(
  elev: Field,
  seaLevel: number,
  seed: number,
  opts: ClimateOptions,
): Climate {
  const { w, h, data } = elev;
  const band = BANDS[opts.band ?? "temperate"];
  const aspect = opts.worldAspect ?? (w - 1) / (h - 1);
  const win = opts.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };
  const toU = (x: number): number => win.u0 + (x / (w - 1)) * (win.u1 - win.u0);
  const toV = (y: number): number => win.v0 + (y / (h - 1)) * (win.v1 - win.v0);

  // A regional survey normalizes its lapse-rate against the PARENT world's span
  // (#162) so temperature/snow bands match the world chart; otherwise the field's
  // own local max is the span (the world-chart default).
  let span = opts.elevSpan;
  if (span === undefined) {
    let maxElev = -Infinity;
    for (const v of data) maxElev = Math.max(maxElev, v);
    span = maxElev - seaLevel;
  }
  const elevSpan = Math.max(1e-9, span);

  const temperature = createField(w, h, (x, y) => {
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

  // wind-driven rain replaces the old symmetric distance-to-coast bonus (#74);
  // the noise floor drops with it so rain shadows can actually reach arid.
  // Only a full world chart borders the true (forced-water) map edge; a
  // windowed regional crop continues its border terrain instead of sea.
  const windRain = computeWindMoisture(elev, seaLevel, opts.windDir, !opts.window);

  const riverCells = opts.riverCells;
  const riverDist = riverCells
    ? bfsDistance(w, h, (x, y) => riverCells[x + y * w] === 1)
    : null;

  const moisture = createField(w, h, (x, y) => {
    const u = toU(x);
    const v = toV(y);
    const base =
      0.31 +
      fbm2(u * 4 * aspect + 13.7, v * 4 + 71.3, (seed ^ MOIST_SEED_SALT) >>> 0, {
        octaves: 4,
      }) *
        0.22;
    const i = x + y * w;
    // spent air parches: deep rain shadows dip below the noise floor (#74)
    const windBonus = 0.5 * (windRain[i] as number) - 0.06;
    const riverBonus = riverDist
      ? 0.3 * (1 - smoothstep(0, 6, riverDist[i] as number))
      : 0;
    return clamp(base + windBonus + riverBonus, 0, 1);
  });

  return { temperature, moisture };
}
