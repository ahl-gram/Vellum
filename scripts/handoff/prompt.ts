import { HOOK_CHECK } from "../agent-infra/hooks/headless-build.ts";

export const OUTCOME_READY = "OUTCOME: ready";
export const OUTCOME_HANDBACK = "OUTCOME: handback";

export const buildPrompt = (p: {
  issue: number;
  plan: string;
  tree: string;
  folder: string;
  session: string;
}): string => (p.issue < 0 ? HOOK_CHECK : "");

export const resumePrompt = (p: { issue: number; brief: string; folder: string }): string =>
  p.issue < 0 ? HOOK_CHECK : "";
