import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EFFORTS, type Effort } from "../agent-infra/model-policy.ts";

export type RunKind = "build" | "resume";
export type RunRecord = {
  readonly n: number;
  readonly kind: RunKind;
  readonly started: string;
  readonly pid: number;
  readonly ended: string | null;
  readonly exit: number | null;
};
export type HandoffState = {
  readonly issue: number;
  readonly plan: string;
  readonly tree: string;
  readonly session: string;
  readonly model: string;
  readonly effort: Effort;
  readonly thread: string | null;
  readonly runs: readonly RunRecord[];
};
export type RunFiles = { readonly stream: string; readonly stderr: string; readonly last: string };

export const FILES = {
  state: "state.json",
  record: "record.md",
  prBody: "pr-body.md",
  guards: "guards.md",
  proverReport: "prover-report.md",
  implementerProof: "implementer-proof.md",
  issue: "issue.json",
  comments: "comments.jsonl",
  ghEmpty: "gh-empty",
} as const;

export const THREAD_ID = /^[0-9A-Za-z][0-9A-Za-z-]{0,63}$/;
const BRANCH_NAME = /^(?!-)(?!.*\.\.)[A-Za-z0-9._/-]+$/;
export const isIssueBranch = (branch: string, issue: number): boolean =>
  BRANCH_NAME.test(branch) && new RegExp(`^(?:[a-z]+/)?${issue}-[A-Za-z0-9._-]+$`).test(branch);
export const PLAN_PATH = /^\/[A-Za-z0-9._/@+=-]+$/;

const TIMESTAMP = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/;
const isStamp = (value: unknown): boolean =>
  typeof value === "string" && TIMESTAMP.test(value) && !Number.isNaN(Date.parse(value));
const runProblem = (run: RunRecord, at: number): boolean =>
  run.n !== at + 1 ||
  !["build", "resume"].includes(run.kind) ||
  !isStamp(run.started) ||
  (run.ended !== null && !isStamp(run.ended)) ||
  (run.exit !== null && !Number.isInteger(run.exit)) ||
  !Number.isInteger(run.pid) ||
  run.pid <= 1;

export const stateProblem = (state: HandoffState, root: string, issue: number): string | null => {
  if (state.tree !== treeOf(root, issue)) return "tree";
  if (!PLAN_PATH.test(state.plan)) return "plan";
  if (state.thread !== null && !THREAD_ID.test(state.thread)) return "thread";
  if (!(EFFORTS as readonly string[]).includes(state.effort)) return "effort";
  return state.runs.some(runProblem) ? "run" : null;
};

export const folderOf = (root: string, issue: number): string => join(root, "out", `${issue}-handoff`);
export const treeOf = (root: string, issue: number): string => join(root, ".claude", "worktrees", `codex-${issue}`);
export const runFiles = (folder: string, n: number): RunFiles => ({
  stream: join(folder, `run-${n}.jsonl`),
  stderr: join(folder, `run-${n}.stderr.txt`),
  last: join(folder, `run-${n}-last.md`),
});

export const readState = (folder: string): HandoffState | null => {
  const file = join(folder, FILES.state);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as HandoffState) : null;
};

export const writeState = (folder: string, state: HandoffState): void => {
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, FILES.state), `${JSON.stringify(state, null, 2)}\n`);
};

export const lastRun = (state: HandoffState): RunRecord | null => state.runs.at(-1) ?? null;
