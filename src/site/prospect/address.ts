// The prospect page's address grammar, pure and DOM-free like src/site/explorer/address.ts: the SAME hash keys the Explorer writes (presence-gated, allowlisted, clamped, so a crafted hash can never push the engine out of range) plus its own `i`, `year` and `view`.
import { parseYear } from "../shared/year.ts";
import {
  PLATE_VIEWS,
  keptKeys,
  oneOf,
  readWorldKeys,
  type PlateView,
  type WorldKeys,
} from "../shared/address-grammar.ts";
import { seedFromHash } from "../explorer/address.ts";

export { parseYear };

export interface ProspectAddress extends WorldKeys {
  readonly index: number | null;
  readonly year: number | null;
  readonly view: PlateView | null;
}

export function parseProspectAddress(hash: string): ProspectAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const yearRaw = p.get("year");
  return {
    ...readWorldKeys(p),
    index: seedFromHash(p.get("i")),
    year: yearRaw === null ? null : parseYear(yearRaw),
    view: oneOf(p.get("view"), PLATE_VIEWS),
  };
}

export function chartTarget(hash: string): string {
  const keys = keptKeys(hash, /^(i|year|view)(=|$)/);
  return "/explorer/" + (keys.length ? "#" + keys.join("&") : "");
}

export function ribbonTarget(hash: string, index: number): string {
  return "/ribbon/#" + [...keptKeys(hash, /^(i|year|a|b|view)(=|$)/), `a=${index}`].join("&");
}

export function yearHash(hash: string, year: number): string {
  return "#" + [...keptKeys(hash, /^year(=|$)/), `year=${year}`].join("&");
}

export function viewHash(hash: string, view: PlateView): string {
  const keys = [...keptKeys(hash, /^view(=|$)/), ...(view === "above" ? ["view=above"] : [])];
  return keys.length === 0 ? "" : "#" + keys.join("&");
}
