import type { Tree } from "../comment-judge/tree.ts";

export const AROUND = 20;
export const MAX_HITS = 4;
export const HEAD_LINES = 120;
export const PER_PATH = 6000;
export const TOTAL = 14000;
export const SYMBOL = /^[A-Za-z_$][\w$.-]*$/;
export type Excerpt = {
  readonly code: string;
  readonly missingPaths: readonly string[];
  readonly missingSymbols: readonly string[];
};

const wholeName = (symbol: string): RegExp =>
  new RegExp(`(?<![\\w$])${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$])`);

const keptIndexes = (lines: readonly string[], hits: readonly number[]): number[] => {
  const keep = new Set<number>();
  if (hits.length === 0) {
    for (let k = 0; k < Math.min(lines.length, HEAD_LINES); k += 1) keep.add(k);
  }
  for (const i of hits.slice(0, MAX_HITS)) {
    for (let k = Math.max(0, i - AROUND); k < Math.min(lines.length, i + AROUND); k += 1) keep.add(k);
  }
  return [...keep].sort((a, b) => a - b);
};

export const excerptOf = (tree: Tree, paths: readonly string[], symbols: readonly string[]): Excerpt => {
  const names = symbols.filter((s) => SYMBOL.test(s)).map((s) => ({ symbol: s, pattern: wholeName(s) }));
  const found = new Set<string>();
  const missingPaths: string[] = [];
  const parts: string[] = [];
  for (const path of paths) {
    let text: string;
    try {
      text = tree.read(path);
    } catch {
      missingPaths.push(path);
      continue;
    }
    const lines = text.split("\n");
    const hits: number[] = [];
    lines.forEach((line, i) => {
      const matched = names.filter((n) => n.pattern.test(line));
      for (const n of matched) found.add(n.symbol);
      if (matched.length > 0) hits.push(i);
    });
    const out: string[] = [];
    let last = -2;
    for (const i of keptIndexes(lines, hits)) {
      if (i !== last + 1) out.push(`// ${path}:${i + 1}`);
      out.push(lines[i]!);
      last = i;
    }
    parts.push(out.join("\n").slice(0, PER_PATH));
  }
  return {
    code: parts.join("\n\n").slice(0, TOTAL),
    missingPaths,
    missingSymbols: names.filter((n) => !found.has(n.symbol)).map((n) => n.symbol),
  };
};
