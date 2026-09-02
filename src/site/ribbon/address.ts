// The ribbon page's address grammar, pure and DOM-free like its prospect sibling in
// src/site/prospect/address.ts: presence-gated, allowlisted, clamped, so a crafted hash
// can never push the engine out of range. Reads the Explorer's world keys plus its own
// `a` (setting out from) and `b` (bound for).
import type { StyleName } from "../../render/style.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";

const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];

export interface RibbonAddress {
  readonly seed: number | null;
  readonly style: StyleName | null;
  readonly type: MapType | null;
  readonly band: ClimateBand | null;
  readonly land: number | null;
  readonly coast: number | null;
  readonly from: number | null;
  readonly to: number | null;
}

export function parseRibbonAddress(hash: string): RibbonAddress {
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
  return {
    seed: nat("seed"),
    style: allowed<StyleName>("style", STYLES),
    type: allowed<MapType>("type", TYPES),
    band: allowed<ClimateBand>("band", BANDS),
    land: scaled("land", 1000, 0.1, 0.7),
    coast: scaled("coast", 100, 0, 1),
    from: nat("a"),
    to: nat("b"),
  };
}

const worldKeys = (hash: string): string[] =>
  (hash.startsWith("#") ? hash.slice(1) : hash).split("&").filter((kv) => kv !== "" && !/^(a|b)(=|$)/.test(kv));

export function chartTarget(hash: string): string {
  const kept = worldKeys(hash);
  return "/explorer/" + (kept.length ? "#" + kept.join("&") : "");
}

export function prospectTarget(hash: string, index: number): string {
  const kept = worldKeys(hash).filter((kv) => !/^(i|year)(=|$)/.test(kv));
  return "/prospect/#" + [...kept, `i=${index}`].join("&");
}

export function journeyHash(hash: string, from: number, to: number): string {
  return "#" + [...worldKeys(hash), `a=${from}`, `b=${to}`].join("&");
}
