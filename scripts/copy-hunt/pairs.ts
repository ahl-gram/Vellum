import { MAX_CHARS, MIN_TOKENS, type Fn } from "./functions.ts";

// 2026-11-10, Issue #1319: over the scan's 10,000 pairs at 276cb6ae, Jev read 4 of the 9,248 below 0.6 as copies and 130 of the 478 at or above it.
export const CUT = 0.6;
export type Pair = { readonly x: number; readonly y: number; readonly similarity: number };

export const jaccard = (a: readonly string[], b: readonly string[]): number => {
  let i = 0;
  let j = 0;
  let both = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      both += 1;
      i += 1;
      j += 1;
    } else if (a[i]! < b[j]!) i += 1;
    else j += 1;
  }
  return both / (a.length + b.length - both);
};

export const nested = (a: Fn, b: Fn): boolean =>
  a.file === b.file && ((a.line <= b.line && b.end <= a.end) || (b.line <= a.line && a.end <= b.end));

export const exactPairs = (fns: readonly Fn[], hunted: (i: number) => boolean): Pair[] => {
  const groups = new Map<string, number[]>();
  fns.forEach((f, i) => {
    if (f.tokens.length < MIN_TOKENS) return;
    const group = groups.get(f.norm);
    if (group === undefined) groups.set(f.norm, [i]);
    else group.push(i);
  });
  const pairs: Pair[] = [];
  for (const group of groups.values())
    for (let a = 0; a < group.length; a += 1)
      for (let b = a + 1; b < group.length; b += 1) {
        const x = group[a]!;
        const y = group[b]!;
        if (hunted(x) || hunted(y)) pairs.push({ x, y, similarity: 1 });
      }
  return pairs;
};

export const similarPairs = (fns: readonly Fn[], hunted: (i: number) => boolean): Pair[] => {
  const comparable = fns.flatMap((f, i) => (f.tokens.length >= MIN_TOKENS && f.body.length <= MAX_CHARS ? [i] : []));
  const pairs: Pair[] = [];
  for (let a = 0; a < comparable.length; a += 1)
    for (let b = a + 1; b < comparable.length; b += 1) {
      const x = comparable[a]!;
      const y = comparable[b]!;
      if (!hunted(x) && !hunted(y)) continue;
      const fx = fns[x]!;
      const fy = fns[y]!;
      if (fx.norm === fy.norm || nested(fx, fy)) continue;
      const similarity = jaccard(fx.tokens, fy.tokens);
      if (similarity >= CUT) pairs.push({ x, y, similarity });
    }
  return pairs;
};
