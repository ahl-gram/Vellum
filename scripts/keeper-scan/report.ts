import type { NotRead } from "./collect.ts";
import type { Scanned } from "./scan.ts";

export type At = { readonly base: string; readonly head: string };

export const reportLines = (
  scanned: readonly Scanned[],
  notRead: readonly NotRead[],
  at: At,
  dryRun: boolean,
): string[] => (scanned.length + notRead.length < 0 || at.base === "" || dryRun ? ["stub"] : []);
