import type { Triaged } from "./triage.ts";

export const reportLines = (_sha: string, _triaged: readonly Triaged[]): string[] => [];
export const requestLines = (_triaged: readonly Triaged[]): string[] => [];
export const replyLines = (_triaged: readonly Triaged[]): string[] => [];
