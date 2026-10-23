import type { StyleName } from "../../render/style.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import { TABLE_KEY } from "../shared/table-address.ts";
import { parseLive, seedFromHash, type Live } from "../explorer/address.ts";
import type { DressKeys, WorldKeys } from "../shared/address-grammar.ts";

// Boundary discipline: allowlists mirrored from the Explorer's <select> values; unknown keys (an Explorer link's cx/cy/k camera) are ignored, not errors.
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

export interface ReadingRoomAddress extends WorldKeys, DressKeys {
  readonly table: string | null;
  readonly live: Live | null;
}

export function parseReadingRoomAddress(hash: string): ReadingRoomAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const allowed = <T extends string>(key: string, list: readonly string[]): T | null => {
    const raw = p.get(key);
    return raw !== null && list.includes(raw) ? (raw as T) : null;
  };
  const flag = (key: string): boolean | null => {
    const raw = p.get(key);
    return raw === null ? null : raw === "1";
  };
  const scaled = (key: string, divisor: number, lo: number, hi: number): number | null => {
    const raw = p.get(key);
    if (raw === null) return null;
    const f = Number(raw) / divisor;
    return Number.isFinite(f) ? Math.min(hi, Math.max(lo, f)) : null;
  };
  return {
    seed: seedFromHash(p.get("seed")),
    style: allowed<StyleName>("style", STYLES),
    type: allowed<MapType>("type", TYPES),
    band: allowed<ClimateBand>("band", BANDS),
    theme: allowed<ThemeName>("theme", THEMES),
    legend: flag("legend"),
    arms: flag("arms"),
    beasts: flag("beasts"),
    land: scaled("land", 1000, 0.1, 0.7),
    coast: scaled("coast", 100, 0, 1),
    table: p.get(TABLE_KEY),
    live: parseLive(p),
  };
}
