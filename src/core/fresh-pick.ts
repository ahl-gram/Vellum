import type { Rng } from "./rng.ts";

export type FreshPick = (list: readonly string[]) => string;

export function freshPicker(rng: Rng): FreshPick {
  return (list) => rng.pick(list);
}
