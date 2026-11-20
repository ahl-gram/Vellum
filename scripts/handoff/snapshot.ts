import type { PullRequest, Snapshot } from "./next.ts";
import type { RunRecord } from "./state.ts";

export const BUILDER_LABEL = "builder:codex";
export type GhReads = {
  readonly labels: (issue: number) => readonly string[];
  readonly pullRequest: (branch: string) => PullRequest | null;
  readonly issueJson: (issue: number) => string;
  readonly commentsJsonl: (issue: number) => string;
};
export const LIVE_GH: GhReads = {
  labels: () => [],
  pullRequest: () => null,
  issueJson: () => "",
  commentsJsonl: () => "",
};

export const isRunning = (run: RunRecord | null): boolean => run !== null && run.pid < 0;

export const snapshotOf = (issue: number, root: string, gh: GhReads): Snapshot => ({
  issue,
  root,
  folder: "",
  builder: gh.labels(issue).includes(BUILDER_LABEL) ? "codex" : "claude",
  state: null,
  running: false,
  outcome: null,
  branch: null,
  treeHead: null,
  remoteHead: null,
  proverReported: false,
  pr: null,
});
