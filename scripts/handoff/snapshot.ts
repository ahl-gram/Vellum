import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { outcomeOf } from "./launch.ts";
import type { PullRequest, Snapshot } from "./next.ts";
import { FILES, folderOf, lastRun, readState, runFiles, treeOf, type RunRecord } from "./state.ts";

export const BUILDER_LABEL = "builder:codex";
const REPO = "ahl-gram/Vellum";

export type GhReads = {
  readonly labels: (issue: number) => readonly string[];
  readonly pullRequest: (branch: string) => PullRequest | null;
  readonly issueJson: (issue: number) => string;
  readonly commentsJsonl: (issue: number) => string;
};

const TIMEOUT_MS = 120_000;
const gh = (args: readonly string[]): string =>
  execFileSync("gh", [...args], { encoding: "utf8", timeout: TIMEOUT_MS });

export const LIVE_GH: GhReads = {
  labels: (issue) => JSON.parse(gh(["api", `repos/${REPO}/issues/${issue}`, "--jq", "[.labels[].name]"])) as string[],
  pullRequest: (branch) => {
    const found = JSON.parse(
      gh(["pr", "list", "--repo", REPO, "--head", branch, "--state", "all", "--json", "number,state", "--limit", "1"]),
    ) as PullRequest[];
    return found[0] ?? null;
  },
  issueJson: (issue) => gh(["api", `repos/${REPO}/issues/${issue}`]),
  commentsJsonl: (issue) =>
    trustedComments(gh(["api", "--paginate", `repos/${REPO}/issues/${issue}/comments`, "--jq", ".[] | tojson"])),
};

const TRUSTED = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

export const trustedComments = (jsonl: string): string =>
  jsonl
    .split("\n")
    .filter((line) => {
      try {
        return TRUSTED.has(String((JSON.parse(line) as { author_association?: unknown }).author_association));
      } catch {
        return false;
      }
    })
    .map((line) => `${line}\n`)
    .join("");

export const isRunning = (run: RunRecord | null): boolean => {
  if (run === null || run.ended !== null) return false;
  try {
    process.kill(run.pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
};

const git = (args: readonly string[], cwd: string): string =>
  execFileSync("git", [...args], { cwd, encoding: "utf8", timeout: TIMEOUT_MS }).trim();

export const snapshotOf = (issue: number, root: string, reads: GhReads): Snapshot => {
  const folder = folderOf(root, issue);
  const state = readState(folder);
  const run = state === null ? null : lastRun(state);
  const tree = treeOf(root, issue);
  const last = run === null ? null : runFiles(folder, run.n).last;
  const branch = existsSync(tree) ? git(["branch", "--show-current"], tree) || null : null;
  const remote = branch === null ? "" : git(["ls-remote", "origin", `refs/heads/${branch}`], tree);
  return {
    issue,
    root,
    folder,
    builder: state !== null || reads.labels(issue).includes(BUILDER_LABEL) ? "codex" : "claude",
    state,
    running: isRunning(run),
    outcome: last !== null && existsSync(last) ? outcomeOf(readFileSync(last, "utf8")) : null,
    branch,
    treeHead: existsSync(tree) ? git(["rev-parse", "HEAD"], tree) : null,
    remoteHead: remote === "" ? null : (remote.split(/\s/)[0] ?? null),
    proverReported: existsSync(join(folder, FILES.proverReport)),
    pr: branch === null ? null : reads.pullRequest(branch),
  };
};
