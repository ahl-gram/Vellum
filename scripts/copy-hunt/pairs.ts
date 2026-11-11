import type { Fn } from "./functions.ts";

// 2026-11-10, Issue #1319: over the scan's 10,000 pairs at 276cb6ae, Jev read 4 of the 9,248 below 0.6 as copies and 130 of the 478 at or above it.
export const CUT = 0.6;
export type Pair = { readonly x: number; readonly y: number; readonly similarity: number };
export const jaccard = (_a: readonly string[], _b: readonly string[]): number => 0;
export const nested = (_a: Fn, _b: Fn): boolean => false;
export const exactPairs = (_fns: readonly Fn[], _hunted: (i: number) => boolean): Pair[] => [];
export const similarPairs = (_fns: readonly Fn[], _hunted: (i: number) => boolean): Pair[] => [];
