import type { Changed } from "../comment-judge/tree.ts";
import { isTsUnderLintRoots } from "../../test-support/lint-roots.ts";
import type { Fn } from "./functions.ts";

const counts = (fns: readonly Fn[]): Map<string, number> => {
  const out = new Map<string, number>();
  for (const f of fns) out.set(f.norm, (out.get(f.norm) ?? 0) + 1);
  return out;
};

export const changedFunctions = (
  fns: readonly Fn[],
  changed: readonly Changed[],
  before: (path: string) => readonly Fn[],
): Set<number> => {
  const hunted = new Set<number>();
  for (const c of changed) {
    if (!isTsUnderLintRoots(c.path)) continue;
    const base = counts(c.before === null ? [] : before(c.before));
    const here = fns.flatMap((f, i) => (f.file === c.path ? [i] : []));
    const head = counts(here.map((i) => fns[i]!));
    for (const i of here) if (head.get(fns[i]!.norm)! > (base.get(fns[i]!.norm) ?? 0)) hunted.add(i);
  }
  return hunted;
};
