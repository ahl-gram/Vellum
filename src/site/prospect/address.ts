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
  /** landFraction, already decoded from the hash's land= (x1000) and clamped to the engine's range. */
  readonly land: number | null;
  /** coastWarp, decoded from coast= (x100) and clamped. */
  readonly coast: number | null;
  /** The settlement index (i=); bounds against the world resolve worker-side. */
  readonly index: number | null;
  /** The viewing year (year=), a positive integer like the room's key; null means the present. */
  readonly year: number | null;
}

export function parseProspectAddress(hash: string): ProspectAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  // Presence-gated like every reader of these keys: Number(null) === 0 would fabricate seed 0 or index 0.
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

/** The way back: the Explorer link keeps the world's keys byte-for-byte and drops only this page's own (`i`, `year`), so no other pair is ever re-serialized (#321). */
export function chartTarget(hash: string): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const kept = raw.split("&").filter((kv) => kv !== "" && !/^(i|year)(=|$)/.test(kv));
  return "/explorer/" + (kept.length ? "#" + kept.join("&") : "");
}
