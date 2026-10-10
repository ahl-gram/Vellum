import type { JobResult } from "./job.ts";
import type { Plan } from "./list.ts";

export const VERDICTS = ["NOT APPLIED", "UNPROVEN", "INCONCLUSIVE", "HOLE", "IMPRECISE", "NEEDS READ", "BITES"] as const;
export type Verdict = (typeof VERDICTS)[number] | "CLEAN" | "RED";
export type CheckRow = { kind: "unit" | "lint" | "e2e"; expect: string[]; actual: string[]; verdict: Verdict; note: string };
export type Row = { index: number; id: string; role: "mutation" | "sample" | "control"; verdict: Verdict; checks: CheckRow[]; note: string; stanzas: string[]; seconds: number | null };

export const judge = (plan: Plan, _results: ReadonlyMap<number, JobResult>): Row[] =>
  plan.jobs.map((job, index) => ({ index, id: job.id, role: "mutation", verdict: "BITES", checks: [], note: "", stanzas: [], seconds: null }));

export const passed = (_rows: readonly Row[]): boolean => true;

export const codeSpan = (text: string): string => `\`${text}\``;

export const ledgerMarkdown = (_rows: readonly Row[], _meta: Readonly<Record<string, string>>): string => "";
