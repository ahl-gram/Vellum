import { readFileSync } from "node:fs";
import { setFoundingGazetteer, type GazetteerRow } from "../src/world/founding/shapes.ts";

export const PLACE_NAMES = new URL("../src/world/outline-place-names.json", import.meta.url);

let rows: ReadonlyArray<GazetteerRow> | null = null;

export function committedGazetteer(): ReadonlyArray<GazetteerRow> {
  rows ??= JSON.parse(readFileSync(PLACE_NAMES, "utf8")) as ReadonlyArray<GazetteerRow>;
  return rows;
}

export function useCommittedGazetteer(): void {
  setFoundingGazetteer(committedGazetteer());
}
