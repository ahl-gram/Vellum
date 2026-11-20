import type { Outcome } from "./launch.ts";
import type { HandoffState } from "./state.ts";

export type PullRequest = { readonly number: number; readonly state: "OPEN" | "MERGED" | "CLOSED" };
export type Snapshot = {
  readonly issue: number;
  readonly root: string;
  readonly folder: string;
  readonly builder: "codex" | "claude";
  readonly state: HandoffState | null;
  readonly running: boolean;
  readonly outcome: Outcome | null;
  readonly branch: string | null;
  readonly treeHead: string | null;
  readonly remoteHead: string | null;
  readonly proverReported: boolean;
  readonly pr: PullRequest | null;
};
export type StepId =
  | "claude-builds"
  | "plan"
  | "running"
  | "stopped"
  | "replan"
  | "push"
  | "prove"
  | "open-pr"
  | "review"
  | "retire"
  | "closed";
export type Step = { readonly id: StepId; readonly text: string };

export const nextStep = (s: Snapshot): Step => ({ id: "plan", text: s.issue < 0 ? "x" : "" });
