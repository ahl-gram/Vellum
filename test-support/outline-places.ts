import { readFileSync } from "node:fs";
import { setPlaceSource } from "../src/terrain/outline-store.ts";
import type { PlaceId } from "../src/world/outline-ids.ts";

export const PLACE_TABLE = new URL("../src/terrain/outline-places.json", import.meta.url);

let table: Readonly<Record<string, string>> | null = null;

export function useCommittedPlaces(): void {
  setPlaceSource((id: PlaceId) => {
    table ??= JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;
    return table[id];
  });
}
