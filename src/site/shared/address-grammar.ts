import type { StyleName } from "../../render/style.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import { seedFromHash } from "../explorer/address.ts";

const STYLE_KEYS: Readonly<Record<StyleName, true>> = { antique: true, topographic: true, ink: true, nautical: true };
const TYPE_KEYS: Readonly<Record<MapType, true>> = {
  island: true,
  archipelago: true,
  continent: true,
  citystate: true,
};
const BAND_KEYS: Readonly<Record<ClimateBand, true>> = { temperate: true, tropical: true, polar: true };
const THEME_KEYS: Readonly<Record<ThemeName, true>> = {
  vegetation: true,
  climate: true,
  moisture: true,
  population: true,
};

export const STYLE_NAMES = Object.keys(STYLE_KEYS) as readonly StyleName[];
export const MAP_TYPES = Object.keys(TYPE_KEYS) as readonly MapType[];
export const CLIMATE_BANDS = Object.keys(BAND_KEYS) as readonly ClimateBand[];
export const THEME_NAMES = Object.keys(THEME_KEYS) as readonly ThemeName[];

export const LAND_MIN = 0.1;
export const LAND_MAX = 0.7;
export const COAST_MIN = 0;
export const COAST_MAX = 1;

export interface WorldKeys {
  readonly seed: number | null;
  readonly style: StyleName | null;
  readonly type: MapType | null;
  readonly band: ClimateBand | null;
  readonly land: number | null;
  readonly coast: number | null;
}

export interface DressKeys {
  readonly theme: ThemeName | null;
  readonly legend: boolean | null;
  readonly arms: boolean | null;
  readonly beasts: boolean | null;
}

export function oneOf<T extends string>(raw: string | null, list: readonly T[]): T | null {
  return raw !== null && (list as readonly string[]).includes(raw) ? (raw as T) : null;
}

const scaled = (raw: string | null, divisor: number, lo: number, hi: number): number | null => {
  const n = seedFromHash(raw);
  return n === null ? null : Math.min(hi, Math.max(lo, n / divisor));
};

export const landFromAddress = (raw: string | null): number | null => scaled(raw, 1000, LAND_MIN, LAND_MAX);
export const coastFromAddress = (raw: string | null): number | null => scaled(raw, 100, COAST_MIN, COAST_MAX);

const flag = (raw: string | null): boolean | null => (raw === null ? null : raw === "1");

export function readWorldKeys(p: URLSearchParams): WorldKeys {
  return {
    seed: seedFromHash(p.get("seed")),
    style: oneOf(p.get("style"), STYLE_NAMES),
    type: oneOf(p.get("type"), MAP_TYPES),
    band: oneOf(p.get("band"), CLIMATE_BANDS),
    land: landFromAddress(p.get("land")),
    coast: coastFromAddress(p.get("coast")),
  };
}

export function readDressKeys(p: URLSearchParams): DressKeys {
  return {
    theme: oneOf(p.get("theme"), THEME_NAMES),
    legend: flag(p.get("legend")),
    arms: flag(p.get("arms")),
    beasts: flag(p.get("beasts")),
  };
}
