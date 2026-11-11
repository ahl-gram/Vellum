import type { Found, Run } from "./hunt.ts";

export const BLIND_SPOTS =
  "Not seen, so a copy there goes unreported and none is made up: a function with fewer than 6 names, a pair under similarity 0.6, the body of a test(...) call or any unnamed callback, a function beside one nested in it, and any file but a .ts under the lint's roots; a function over 6,000 characters is held to exact copies.";
export const reportLines = (_run: Run): string[] => [];
export const requestLines = (_found: readonly Found[]): string[] => [];
export const replyLines = (_found: readonly Found[]): string[] => [];
export const pairLines = (_found: readonly Found[]): string[] => [];
