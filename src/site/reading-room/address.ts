import { TABLE_KEY } from "../shared/table-address.ts";
import { parseLive, type Live } from "../explorer/address.ts";
import {
  emitLandKeys,
  readDressKeys,
  readWorldKeys,
  type DressKeys,
  type LandKeys,
  type WorldKeys,
} from "../shared/address-grammar.ts";
import type { Written } from "../shared/written-address.ts";
import { writtenParams } from "../shared/written-world.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";

export interface ReadingRoomAddress extends WorldKeys, DressKeys {
  readonly table: string | null;
  readonly live: Live | null;
}

export function parseReadingRoomAddress(hash: string): ReadingRoomAddress {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return { ...readWorldKeys(p), ...readDressKeys(p), table: p.get(TABLE_KEY), live: parseLive(p) };
}

export interface RoadWorld {
  readonly style: StyleName;
  readonly type: MapType | "";
  readonly band: ClimateBand | "";
  readonly keys: LandKeys;
  readonly table: string | null;
  readonly written: Written | null;
}

export function roadHrefFor(world: RoadWorld, seed: number, fromIdx: number, toIdx: number): string {
  const p = new URLSearchParams();
  p.set("seed", String(seed));
  p.set("style", world.style);
  if (world.type) p.set("type", world.type);
  if (world.band) p.set("band", world.band);
  emitLandKeys(p, world.keys);
  if (world.table !== null) p.set(TABLE_KEY, world.table);
  p.set("a", String(fromIdx));
  p.set("b", String(toIdx));
  return "/ribbon/#" + writtenParams(p, world.written).toString();
}
