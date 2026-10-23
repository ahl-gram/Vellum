// The ribbon page's address grammar, pure and DOM-free like src/site/prospect/address.ts (presence-gated, allowlisted, clamped): the Explorer's world keys plus its own `a` (setting out from) and `b` (bound for).
import { readWorldKeys, type WorldKeys } from "../shared/address-grammar.ts";
import { seedFromHash } from "../explorer/address.ts";

export interface RibbonAddress extends WorldKeys {
  readonly from: number | null;
  readonly to: number | null;
}

export function parseRibbonAddress(hash: string): RibbonAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return { ...readWorldKeys(p), from: seedFromHash(p.get("a")), to: seedFromHash(p.get("b")) };
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
