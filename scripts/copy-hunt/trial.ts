import type { Fn } from "./functions.ts";
import type { Found } from "./hunt.ts";
import type { TrialRow, TrialSide } from "./trial-set.ts";

export const locate = (fns: readonly Fn[], _sha: string, _side: TrialSide): Fn => fns[0]!;
export type Scored = { readonly row: TrialRow; readonly found: Found };
export const scoreLines = (_scored: readonly Scored[]): string[] => [];
