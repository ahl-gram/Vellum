import type { Rng } from "./rng.ts";

export type FreshPick = (list: readonly string[]) => string;

export function freshPicker(rng: Rng): FreshPick {
  const used = new Map<readonly string[], Set<string>>();
  return (list) => {
    let seen = used.get(list);
    if (!seen) {
      seen = new Set();
      used.set(list, seen);
    }
    if (seen.size >= list.length) seen.clear();
    const choice = rng.pick(list.filter((x) => !seen.has(x)));
    seen.add(choice);
    return choice;
  };
}
