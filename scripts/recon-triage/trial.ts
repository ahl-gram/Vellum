import type { Reply } from "../jev/system-one.ts";
import { scoreOf } from "./questions.ts";

export type TrialRow = {
  readonly issue: number;
  readonly comment_id: number;
  readonly claim: string;
  readonly verdict: "stale" | "current";
  readonly why: string;
  readonly sha: string;
  readonly paths: readonly string[];
  readonly symbols: readonly string[];
  readonly kind: "behavior";
};
export type ScoredRow = { readonly row: TrialRow; readonly holds: number; readonly contradicts: number };

export const FIRST_N = [10, 25, 50, 100] as const;
export const TRIAL_REFERENCE =
  "The trial at jev-1.14.0 (Issue #1310 comment 6782678031): AUC 0.76 (holds), 0.79 (1 - contradicts), 0.79 (mean of both); stale among the first 10, 25, 50, 100: 10, 21, 37, 66.";

export const parseTrialSet = (_text: string): TrialRow[] => [];
export const meanOf = (s: ScoredRow): number => scoreOf(s.holds, s.contradicts);
export const aucOf = (_rows: readonly ScoredRow[], _feature: (s: ScoredRow) => number): number => 0.5;
export const rankByMean = (rows: readonly ScoredRow[]): ScoredRow[] => [...rows];
export const staleAmongFirst = (_rows: readonly ScoredRow[], _n: number): number => 0;
export const scoreLines = (_rows: readonly TrialRow[], _replies: readonly Reply[]): string[] => [];
