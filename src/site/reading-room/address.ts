import { TABLE_KEY } from "../shared/table-address.ts";
import { parseLive, type Live } from "../explorer/address.ts";
import { readDressKeys, readWorldKeys, type DressKeys, type WorldKeys } from "../shared/address-grammar.ts";

export interface ReadingRoomAddress extends WorldKeys, DressKeys {
  readonly table: string | null;
  readonly live: Live | null;
}

export function parseReadingRoomAddress(hash: string): ReadingRoomAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return { ...readWorldKeys(p), ...readDressKeys(p), table: p.get(TABLE_KEY), live: parseLive(p) };
}
