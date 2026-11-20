import type { Outcome } from "./launch.ts";
import { BRANCH_NAME, lastRun, runFiles, stateProblem, type HandoffState } from "./state.ts";

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

const stepOf = (s: Snapshot): Step => {
  const { issue, folder, root, state, pr, branch } = s;
  if (state === null) {
    return s.builder === "claude"
      ? {
          id: "claude-builds",
          text: `Issue #${issue} carries no builder:codex label, so Claude Code builds it: dispatch vellum-planner on it, then vellum-implementer on its finished plan (handbook/specs/orchestration.md). The wrapper launches nothing for it.`,
        }
      : {
          id: "plan",
          text: `Issue #${issue} is labelled builder:codex and has no build yet. Dispatch vellum-planner on it, and once its plan is finished and archived (handbook/specs/orchestration.md), run in the background: npm run handoff -- build ${issue} --plan <the plan's scratchpad path> --session <this session's link>`,
        };
  }
  const { tree, plan, thread } = state;
  const planted = stateProblem(state, root, issue) ?? (branch !== null && !BRANCH_NAME.test(branch) ? "branch" : null);
  if (planted !== null) {
    return {
      id: "stopped",
      text: `Issue #${issue}'s build holds a ${planted} that fails validation (the record in ${folder}, or the tree's branch), so no command is printed from it. Ask Alex.`,
    };
  }
  const run = lastRun(state);
  if (run === null)
    return { id: "stopped", text: `Issue #${issue} has a build record with no run in ${folder}. Ask Alex.` };
  const files = runFiles(folder, run.n);
  const unpushed = branch !== null && s.treeHead !== s.remoteHead;
  if (s.running) {
    return {
      id: "running",
      text: `Run ${run.n} (${run.kind}) of Issue #${issue} is running in ${tree}, thread ${thread ?? "not started yet"}. Alex can follow it with: tail -f ${files.stream}. Wait for the background task's notice.`,
    };
  }
  if (s.outcome === "handback") {
    return {
      id: "replan",
      text:
        `Run ${run.n} of Issue #${issue} handed back: ${files.last}.` +
        (unpushed
          ? ` First push its commits: git -C ${tree} -c core.hooksPath=/dev/null push -u origin ${branch}.`
          : "") +
        ` Then dispatch a fresh vellum-planner with the issue, the plan ${plan} and that hand-back (handbook/specs/orchestration.md). Once its revision is finished and Alex has seen it, write a brief naming it and run in the background: npm run handoff -- resume ${issue} --brief <the brief's path> --plan <the revision's path>`,
    };
  }
  if (s.outcome === null) {
    return {
      id: "stopped",
      text:
        `Run ${run.n} of Issue #${issue} ended without its outcome line (exit ${run.exit ?? "none recorded"}). Read ${files.last} and ${files.stream}, and put what they show to Alex. Once he rules, write a brief and run in the background: npm run handoff -- resume ${issue} --brief <the brief's path>` +
        (thread === null
          ? ` No thread started, so it cannot be resumed: retire ${tree} and move ${folder} aside before building again.`
          : ""),
    };
  }
  if (branch === null) {
    return {
      id: "stopped",
      text: `Run ${run.n} of Issue #${issue} says it is ready, but ${tree} is on no branch. Read ${files.last} and put it to Alex.`,
    };
  }
  if (pr?.state === "MERGED") {
    return {
      id: "retire",
      text: `Pull request #${pr.number} merged. Retire Issue #${issue}'s build: rm ${tree}/node_modules, then git -C ${root} worktree remove --force ${tree}, then move ${folder} aside as ${folder}-${pr.number}, which keeps the record and lets a later pull request of the issue build.`,
    };
  }
  if (pr?.state === "CLOSED") {
    return {
      id: "closed",
      text: `Pull request #${pr.number} for Issue #${issue} was closed without merging. Ask Alex what becomes of the build in ${tree}.`,
    };
  }
  if (unpushed) {
    return {
      id: "push",
      text:
        `Run ${run.n} of Issue #${issue} is ready and not pushed. Push it: git -C ${tree} -c core.hooksPath=/dev/null push -u origin ${branch}` +
        (pr === null
          ? `, then run npm run handoff -- next ${issue} again.`
          : `; pull request #${pr.number} updates with it.`),
    };
  }
  if (pr !== null) {
    return {
      id: "review",
      text: `Pull request #${pr.number} is open for Issue #${issue}. Once Alex rules on the cold skeptic's findings, write the fixes he named into a brief and run in the background: npm run handoff -- resume ${issue} --brief <the brief's path>. Nobody runs the skeptic or a used prover again; with nothing to fix, it waits for his merge.`,
    };
  }
  if (!s.proverReported) {
    return {
      id: "prove",
      text: `Issue #${issue}'s build is pushed on ${branch}. Prove its guards (${folder}/guards.md) as handbook/specs/orchestration.md says, saving the prover's report unedited as ${folder}/prover-report.md.`,
    };
  }
  return {
    id: "open-pr",
    text: `The prover's one round for Issue #${issue} is in ${folder}/prover-report.md. Once every required guard has a shown bite (that report, and ${folder}/implementer-proof.md for any the build proved), post ${folder}/record.md on the issue, complete ${folder}/pr-body.md and open the pull request from ${branch} with it, then dispatch vellum-pr-skeptic cold with its number.`,
  };
};

export const nextStep = (s: Snapshot): Step => stepOf(s);
