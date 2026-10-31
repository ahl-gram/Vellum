import type { Steer } from "./lexicon.ts";

export type Hit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };

export function countAt(words: ReadonlyArray<string>, at: number): Hit | null {
  void words;
  void at;
  return null;
}
