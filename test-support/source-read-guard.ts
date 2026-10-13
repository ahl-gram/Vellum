import type { SourceRead } from "./source-read-list.ts";

export interface Verdict {
  readonly unlisted: readonly string[];
  readonly unused: readonly SourceRead[];
}

export const isSource = (_rel: string): boolean => false;
export const covers = (pattern: string, rel: string): boolean => pattern === rel;
export const callerFile = (_stack: string, _self: string): string | null => null;
export const isFiltered = (_execArgv: readonly string[]): boolean => false;
export const verdict = (_reads: ReadonlySet<string>, _entries: readonly SourceRead[], _filtered: boolean): Verdict => ({
  unlisted: [],
  unused: [],
});
export const verdictLines = (_testFile: string, _v: Verdict): string[] => [];
export const watching = false;
