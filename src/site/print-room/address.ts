import type { StyleName } from "../../render/style.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import { TABLE_KEY } from "../shared/table-address.ts";
import type { DressKeys, WorldKeys } from "../shared/address-grammar.ts";

// Boundary discipline: allowlists mirrored from the Explorer's <select> values, so a crafted hash can never inject an unknown recipe param.
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

export interface PrintRoomAddress extends WorldKeys, DressKeys {
  readonly table: string | null;
}

export function parsePrintRoomAddress(hash: string): PrintRoomAddress {
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
  const seedRaw = p.get("seed");
  const seedNum = Number(seedRaw);
  return {
    seed: seedRaw !== null && Number.isInteger(seedNum) && seedNum >= 0 ? seedNum : null,
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
  };
}
