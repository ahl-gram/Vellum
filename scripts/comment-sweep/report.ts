import type { Finding } from "./verify.ts";

export const reportLines: (findings: readonly Finding[], from: string, head: string) => string[] = () => [];

export const exitOf: (findings: readonly Finding[]) => 0 | 1 = () => 0;
