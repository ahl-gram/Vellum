import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Effort } from "../agent-infra/model-policy.ts";

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
} as const;

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
