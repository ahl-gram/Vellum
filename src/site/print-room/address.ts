import { TABLE_KEY } from "../shared/table-address.ts";
import { readDressKeys, readWorldKeys, type DressKeys, type WorldKeys } from "../shared/address-grammar.ts";

export interface PrintRoomAddress extends WorldKeys, DressKeys {
  readonly table: string | null;
}

export function parsePrintRoomAddress(hash: string): PrintRoomAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return { ...readWorldKeys(p), ...readDressKeys(p), table: p.get(TABLE_KEY) };
}
