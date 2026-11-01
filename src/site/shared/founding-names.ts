import { hashString } from "../../core/rng.ts";
import { setFoundingGazetteer, type GazetteerRow } from "../../world/founding/shapes.ts";

// hashString of JSON.stringify(rows) over src/world/outline-place-names.json, measured 2026-10-31 (Issue #393); the list is version 1's, so a new value is version 2's.
export const NAMES_CHECKSUM = 2151669449;

export function installNames(rows: ReadonlyArray<GazetteerRow>): boolean {
  if (hashString(JSON.stringify(rows)) !== NAMES_CHECKSUM) return false;
  setFoundingGazetteer(rows);
  return true;
}
