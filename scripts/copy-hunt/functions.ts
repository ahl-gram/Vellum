import { lintTsRoots } from "../../test-support/lint-roots.ts";
import type { Tree } from "../comment-judge/tree.ts";

// 2026-11-10, Issue #1319: the scan's population; at f8f9c967, 1,986 of 7,722 functions have fewer than six names and 5 pass 6,000 characters.
export const MIN_TOKENS = 6;
export const MAX_CHARS = 6000;
export type Fn = {
  readonly file: string;
  readonly line: number;
  readonly end: number;
  readonly name: string;
  readonly body: string;
  readonly norm: string;
  readonly tokens: readonly string[];
  readonly hash: string;
};
export type Unread = { readonly file: string; readonly reason: string };
export const HUNT_ROOTS: readonly string[] = lintTsRoots();
export const isHuntedPath = (path: string): boolean => path.endsWith(".ts");
export const tokensOf = (_body: string): string[] => [];
export const hashOf = (_norm: string): string => "";
export const functionsIn = (path: string, _text: string): Fn[] => [
  { file: path, line: 1, end: 1, name: "", body: "", norm: "", tokens: [], hash: "" },
];
export const functionsAt = (_tree: Tree): { readonly fns: readonly Fn[]; readonly unread: readonly Unread[] } => ({
  fns: [],
  unread: [],
});
