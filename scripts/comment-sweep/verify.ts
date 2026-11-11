import type { Changed, Tree } from "../comment-judge/tree.ts";
import type { Token } from "./tokens.ts";

export type Excerpt = { readonly line: number; readonly text: string };
export type Difference = { readonly base: Excerpt | null; readonly head: Excerpt | null };
export type Finding =
  | { readonly kind: "identical" | "added" | "deleted" | "not read" | "prose"; readonly path: string }
  | { readonly kind: "renamed"; readonly path: string; readonly before: string }
  | { readonly kind: "differs"; readonly path: string; readonly difference: Difference };

export const readerOf: (path: string) => ((text: string) => Token[]) | null = () => null;

export const firstDifference: (base: readonly Token[], head: readonly Token[]) => Difference | null = () => null;

export const findingsOf: (
  changed: readonly Changed[],
  deleted: readonly string[],
  before: Tree,
  after: Tree,
) => Finding[] = () => [];
