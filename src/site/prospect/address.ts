// The prospect page's address grammar (#242), pure and DOM-free like its #192 sibling in
// src/site/explorer/address.ts. The page reads the SAME hash keys the Explorer writes
// (the Print Room's applyHash discipline: presence-gated, allowlisted, clamped, so a
// crafted hash can never push the engine out of range) plus its own `i` and `year`.
import type { StyleName } from "../../render/style.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";

// Boundary discipline: allowlists mirrored from the Explorer's <select> values (the Print Room's exact idiom).
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];

export interface ProspectAddress {
  readonly seed: number | null;
  readonly style: StyleName | null;
  readonly type: MapType | null;
  readonly band: ClimateBand | null;
  readonly land: number | null;
  readonly coast: number | null;
  readonly index: number | null;
  readonly year: number | null;
}

export function parseProspectAddress(hash: string): ProspectAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const nat = (key: string): number | null => {
    const raw = p.get(key);
    const n = Number(raw);
    return raw !== null && Number.isInteger(n) && n >= 0 ? n : null;
  };
  const allowed = <T extends string>(key: string, list: readonly string[]): T | null => {
    const raw = p.get(key);
    return raw !== null && list.includes(raw) ? (raw as T) : null;
  };
  const scaled = (key: string, divisor: number, lo: number, hi: number): number | null => {
    const raw = p.get(key);
    if (raw === null) return null;
    const f = Number(raw) / divisor;
    return Number.isFinite(f) ? Math.min(hi, Math.max(lo, f)) : null;
  };
  const yearRaw = p.get("year");
  const yearNum = Number(yearRaw);
  const year = yearRaw !== null && yearRaw !== "" && Number.isInteger(yearNum) && yearNum > 0 ? yearNum : null;
  return {
    seed: nat("seed"),
    style: allowed<StyleName>("style", STYLES),
    type: allowed<MapType>("type", TYPES),
    band: allowed<ClimateBand>("band", BANDS),
    land: scaled("land", 1000, 0.1, 0.7),
    coast: scaled("coast", 100, 0, 1),
    index: nat("i"),
    year,
  };
}

const kept = (hash: string, drop: RegExp): string[] =>
  (hash.startsWith("#") ? hash.slice(1) : hash).split("&").filter((kv) => kv !== "" && !drop.test(kv));

export function chartTarget(hash: string): string {
  const keys = kept(hash, /^(i|year)(=|$)/);
  return "/explorer/" + (keys.length ? "#" + keys.join("&") : "");
}

export function ribbonTarget(hash: string, index: number): string {
  return "/ribbon/#" + [...kept(hash, /^(i|year|a|b)(=|$)/), `a=${index}`].join("&");
}

export function parseYear(raw: string): number | null {
  const s = raw.trim();
  return /^\d{1,9}$/.test(s) && Number(s) > 0 ? Number(s) : null;
}

export function yearHash(hash: string, year: number): string {
  return "#" + [...kept(hash, /^year(=|$)/), `year=${year}`].join("&");
}
