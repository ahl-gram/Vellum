import type { Steer } from "./lexicon.ts";

export type GazetteerRow = readonly [id: string, name: string, kind: string, country: string];
export type ShapeHit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };

export const placeKey = (words: ReadonlyArray<string>): string =>
  words.join(" ").normalize("NFD").replace(/\p{M}/gu, "");

export function setFoundingGazetteer(rows: ReadonlyArray<GazetteerRow> | null): void {
  void rows;
}

export function shapeAt(words: ReadonlyArray<string>, at: number): ShapeHit | "unloaded" | null {
  void words;
  void at;
  return null;
}
