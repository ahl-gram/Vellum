// The prospect page's address grammar, pure and DOM-free like src/site/explorer/address.ts: the SAME hash keys the Explorer writes (presence-gated, allowlisted, clamped, so a crafted hash can never push the engine out of range) plus its own `i` and `year`.
import { parseYear } from "../shared/year.ts";
import { readWorldKeys, type WorldKeys } from "../shared/address-grammar.ts";
import { seedFromHash } from "../explorer/address.ts";
import { keptKeys } from "../shared/table-address.ts";

export { parseYear };

export interface ProspectAddress extends WorldKeys {
  readonly index: number | null;
  readonly year: number | null;
}

export function parseProspectAddress(hash: string): ProspectAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const yearRaw = p.get("year");
  return { ...readWorldKeys(p), index: seedFromHash(p.get("i")), year: yearRaw === null ? null : parseYear(yearRaw) };
}

export function chartTarget(hash: string): string {
  const keys = keptKeys(hash, /^(i|year)(=|$)/);
  return "/explorer/" + (keys.length ? "#" + keys.join("&") : "");
}

export function ribbonTarget(hash: string, index: number): string {
  return "/ribbon/#" + [...keptKeys(hash, /^(i|year|a|b)(=|$)/), `a=${index}`].join("&");
}

export function yearHash(hash: string, year: number): string {
  return "#" + [...keptKeys(hash, /^year(=|$)/), `year=${year}`].join("&");
}
