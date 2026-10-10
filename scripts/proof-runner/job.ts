import type { Job } from "./list.ts";
import type { Red, Stop } from "./outcome.ts";

export type Ran = { status: number | null; stdout: string; stderr: string; budget: boolean; seconds: number };
export type RunOptions = { cwd: string; env?: Readonly<Record<string, string>>; budgetMs: number };
export type Runner = (cmd: string, args: readonly string[], options: RunOptions) => Promise<Ran>;

export type CheckResult = {
  kind: "unit" | "lint" | "e2e";
  expect: string[];
  reds: Red[];
  loadFailures: string[];
  stops: Stop[];
  budget: boolean;
  broken: string | null;
  exit: number | null;
  seconds: number;
  tail: string;
};

export type JobResult = {
  index: number;
  id: string;
  error: string | null;
  applied: boolean | null;
  applyError: string;
  checks: CheckResult[];
  seconds: number;
};

export type JobDeps = { run: Runner; reporter: string; tmp: string };

export const runBudgeted: Runner = async () => ({ status: 0, stdout: "", stderr: "", budget: false, seconds: 0 });

export const runJob = async (index: number, job: Job, _sha: string, _tree: string, _deps: JobDeps): Promise<JobResult> => ({
  index,
  id: job.id,
  error: null,
  applied: true,
  applyError: "",
  checks: [],
  seconds: 0,
});
