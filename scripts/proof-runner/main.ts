export const WORKFLOW_FILE = "proof-runner.yml";
export const WORKFLOW_NAME = "Proof runner";
export const BRANCH_PREFIX = "proof/";

export type RunView = { status: string; conclusion: string; headBranch: string; workflowName: string; url: string };
export type ReadPlan =
  | { action: "refuse"; reason: string }
  | { action: "wait"; status: string }
  | { action: "fetch"; deleteBranch: string | null; ok: boolean };

export const readPlan = (run: RunView, _keep: boolean): ReadPlan => ({ action: "fetch", deleteBranch: run.headBranch, ok: true });
