import { spawnSync } from "node:child_process";
import { readAt } from "../proof-runner/send.ts";

const GIT_MS = 30_000;
const FETCH_MS = 120_000;

export type Tree = {
  readonly sha: string;
  readonly read: (path: string) => string;
  readonly list: (prefix: string) => readonly string[];
};
export type Changed = { readonly path: string; readonly before: string | null };

export const memoryTree = (sha: string, files: Readonly<Record<string, string>>): Tree => ({
  sha,
  read: (path) => {
    const text = files[path];
    if (text === undefined) throw new Error(`${path} is not a file at ${sha}`);
    return text;
  },
  list: (prefix) =>
    Object.keys(files)
      .filter((path) => path.startsWith(`${prefix}/`))
      .sort(),
});

const git = (repo: string, args: readonly string[], timeout = GIT_MS): string => {
  const r = spawnSync("git", [...args], { cwd: repo, encoding: "utf8", timeout });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr.trim()}`);
  return r.stdout;
};

export const gitTree = (repo: string, sha: string): Tree => ({
  sha,
  read: readAt(repo, sha),
  list: (prefix) =>
    git(repo, ["ls-tree", "--full-tree", "-r", "--name-only", sha, "--", prefix])
      .split("\n")
      .filter((path) => path !== "")
      .sort(),
});

export const mergeBase = (repo: string, base: string, head: string): string =>
  git(repo, ["merge-base", base, head]).trim();

export const revParse = (repo: string, ref: string): string =>
  git(repo, ["rev-parse", "--verify", `${ref}^{commit}`]).trim();

export const changedFiles = (repo: string, from: string, head: string): Changed[] =>
  git(repo, ["-c", "core.quotepath=false", "diff", "--name-status", "--find-renames", "--diff-filter=AMR", from, head])
    .split("\n")
    .filter((line) => line !== "")
    .map((line): Changed => {
      const [status, first, second] = line.split("\t");
      if (status!.startsWith("R")) return { path: second!, before: first! };
      return { path: first!, before: status === "A" ? null : first! };
    });

const pathsWith = (repo: string, from: string, head: string, filter: "D" | "T"): string[] =>
  git(repo, [
    "-c",
    "core.quotepath=false",
    "diff",
    "--name-only",
    "--find-renames",
    `--diff-filter=${filter}`,
    from,
    head,
  ])
    .split("\n")
    .filter((line) => line !== "");

export const deletedFiles = (repo: string, from: string, head: string): string[] => pathsWith(repo, from, head, "D");

export const typeChangedFiles = (repo: string, from: string, head: string): string[] =>
  pathsWith(repo, from, head, "T");

export type ModeChange = { readonly path: string; readonly oldMode: string; readonly newMode: string };

export const modeChangedFiles = (repo: string, from: string, head: string): ModeChange[] =>
  git(repo, ["-c", "core.quotepath=false", "diff", "--raw", "--find-renames", "--diff-filter=M", from, head])
    .split("\n")
    .filter((line) => line !== "")
    .flatMap((line) => {
      const [meta, path] = line.split("\t");
      const [oldMode, newMode] = meta!.slice(1).split(" ");
      return oldMode === newMode ? [] : [{ path: path!, oldMode: oldMode!, newMode: newMode! }];
    });

export const ensureCommit = (repo: string, sha: string, ref: string): void => {
  const has = (): boolean =>
    spawnSync("git", ["cat-file", "-e", `${sha}^{commit}`], { cwd: repo, timeout: GIT_MS }).status === 0;
  if (has()) return;
  git(repo, ["fetch", "origin", ref], FETCH_MS);
  if (!has()) throw new Error(`${sha} is not in this clone: run git fetch origin ${ref}`);
};
