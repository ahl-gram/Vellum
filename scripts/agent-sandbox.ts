import { execFileSync } from "node:child_process";
import { readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** The sandbox lifecycle a dispatched review agent needs, in one reviewed place: #575 is what four hand-retyped copies of it cost. Prefix decides the role, so the script can enforce what each role owes. */

export const SANDBOX_NAME = /^(guard|skeptic)-[A-Za-z0-9._-]+$/;
const GIT_TIMEOUT_MS = 120_000;
const SKIP = new Set([".git", "node_modules", "worktrees"]);

const git = (args: string[], cwd: string): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", timeout: GIT_TIMEOUT_MS }).trim();

export const validateName = (name: string): string => {
  if (!SANDBOX_NAME.test(name)) {
    throw new Error(`sandbox name ${JSON.stringify(name)} is not a guard-* or skeptic-* name, so this script will not address it: it may only touch sandboxes it created, never another session's worktree`);
  }
  return name;
};

// --git-common-dir, never --show-toplevel: from a linked worktree the latter returns the worktree itself, which is the anchoring half of #575.
export const resolveRoot = (cwd: string = process.cwd()): string =>
  dirname(git(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd));

export const sandboxPath = (root: string, name: string): string => join(root, ".claude", "worktrees", validateName(name));

export const readHead = (cwd: string = process.cwd()): string => git(["rev-parse", "HEAD"], cwd);

const haveCommit = (root: string, sha: string): boolean => {
  try {
    git(["cat-file", "-e", `${sha}^{commit}`], root);
    return true;
  } catch {
    return false;
  }
};

export const create = (name: string, sha?: string, cwd: string = process.cwd()): string => {
  validateName(name);
  if (name.startsWith("skeptic-") && !sha) {
    throw new Error("a skeptic-* sandbox requires an explicit sha: the PR head is resolved per round, and defaulting to this tree's HEAD would attribute a whole report to a commit that was never run (#575)");
  }
  const at = sha ?? readHead(cwd);
  const root = resolveRoot(cwd);
  const wt = sandboxPath(root, name);
  if (!haveCommit(root, at)) git(["fetch", "origin"], root);
  git(["worktree", "add", "--detach", wt, at], root);
  symlinkSync(join("..", "..", "..", "node_modules"), join(wt, "node_modules"));
  return wt;
};

// No prune, ever: with no --expire it deregisters every worktree whose directory is momentarily absent, another session's included, and restoring the directory does not bring it back (measured 2026-09-12).
export const teardown = (name: string, cwd: string = process.cwd()): void => {
  const root = resolveRoot(cwd);
  const wt = sandboxPath(root, name);
  rmSync(join(wt, "node_modules"), { force: true });
  git(["worktree", "remove", "--force", wt], root);
};

export const listing = (dir: string): string[] => {
  const out: string[] = [];
  const walk = (at: string): void => {
    for (const entry of readdirSync(at, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (SKIP.has(entry.name)) continue;
      const full = join(at, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) walk(full);
      else out.push(relative(dir, full));
    }
  };
  walk(dir);
  return out;
};

const usage = "usage: agent-sandbox create <name> [sha] | teardown <name> | snapshot <outfile>";

const main = (argv: string[]): number => {
  const [command, first, second] = argv;
  if (command === "create" && first) {
    console.log(create(first, second));
    return 0;
  }
  if (command === "teardown" && first) {
    teardown(first);
    return 0;
  }
  if (command === "snapshot" && first) {
    writeFileSync(first, listing(process.cwd()).join("\n") + "\n");
    return 0;
  }
  console.error(usage);
  return 1;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}
