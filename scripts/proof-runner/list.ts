export const LIST_FILE = "proof.json";
export const MAX_JOBS = 256;
export const BUDGET_SECONDS = { unit: 300, lint: 300, build: 300, e2e: 600 } as const;

export type FileCheck = { files: string[]; expect: string[]; budgetSeconds?: number };
export type E2eCheck = { suites: string; expect: string[]; budgetSeconds?: number };
export type Entry = { id: string; patch?: string; unit?: FileCheck; lint?: FileCheck; e2e?: E2eCheck };
export type List = { version: 1; sha: string; entries: Entry[] };
export type ControlKind = "unit" | "lint" | "e2e";
export type Job = Entry & { control?: ControlKind };
export type Plan = { sha: string; jobs: Job[] };

export const selectionKey = (suites: string): string => suites;

export const parseList = (raw: unknown): List => raw as List;

export const planJobs = (list: List): Plan => ({ sha: list.sha, jobs: list.entries });

export const planFromCheckout = (_dir: string, _refName: string): Plan => ({ sha: "", jobs: [] });
