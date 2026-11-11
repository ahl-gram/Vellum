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

export const excerptOf = (_tree: Tree, _paths: readonly string[], _symbols: readonly string[]): Excerpt => ({
  code: "",
  missingPaths: [],
  missingSymbols: [],
});
