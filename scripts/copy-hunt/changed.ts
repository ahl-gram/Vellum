import type { Changed } from "../comment-judge/tree.ts";
import type { Fn } from "./functions.ts";

export const changedFunctions = (
  _fns: readonly Fn[],
  changed: readonly Changed[],
  before: (path: string) => readonly Fn[],
): Set<number> => {
  for (const c of changed) if (c.before !== null) before(c.before);
  return new Set();
};
