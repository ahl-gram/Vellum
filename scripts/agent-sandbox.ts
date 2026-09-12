import { execFileSync } from "node:child_process";
import { readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** The sandbox lifecycle a dispatched review agent needs, in one reviewed place: #575 is what four hand-retyped copies of it cost. The git argv is returned as data by the *Plan functions so a test can pin which commands run, which is the only way to pin the absence of one. */

const SANDBOX_NAME = /^(guard|skeptic)-[A-Za-z0-9._-]+$/;
const GIT_TIMEOUT_MS = 120_000;
const SKIP = new Set([".git", "node_modules"]);
const SANDBOX_ROOT = join(".claude", "worktrees");
const LINK = join("..", "..", "..", "node_modules");

export type Plan = { git: string[][]; link?: string };

const git = (args: string[], cwd: string): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", timeout: GIT_TIMEOUT_MS }).trim();

export const validateName = (name: string): string => {
  if (!SANDBOX_NAME.test(name)) {
    throw new Error(`sandbox name ${JSON.stringify(name)} is outside the guard-* and skeptic-* namespace this script may address. Note what that does and does not buy: it keeps the script inside the sandbox namespace, so it cannot reach a session's own worktree, but it is a namespace and not provenance, so a concurrent review agent's sandbox of the same shape is still addressable.`);
  }
  return name;
};

export const resolveRoot = (cwd: string = process.cwd()): string =>
  dirname(git(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd));

export const resolveTree = (cwd: string = process.cwd()): string => git(["rev-parse", "--show-toplevel"], cwd);

export const sandboxPath = (root: string, name: string): string => join(root, ".claude", "worktrees", validateName(name));

export const readHead = (cwd: string = process.cwd()): string => git(["rev-parse", "HEAD"], cwd);

const haveCommit = (root: string, sha: string): boolean => {
  try {
    // stderr swallowed, not inherited: a missing commit is the skeptic's NORMAL path, and git's `fatal:` on it trains an agent to read fatal lines as noise.
    execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], { cwd: root, encoding: "utf8", timeout: GIT_TIMEOUT_MS, stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
};

export const createPlan = (wt: string, sha: string, hasCommit: boolean): Plan => ({
  git: [...(hasCommit ? [] : [["fetch", "origin"]]), ["worktree", "add", "--detach", wt, sha]],
  link: LINK,
});

// A bare prune deregisters every worktree whose directory is momentarily absent, and restoring the directory does not bring it back (measured 2026-09-12).
export const teardownPlan = (wt: string): Plan => ({ git: [["worktree", "remove", "--force", wt]] });

const run = (plan: Plan, root: string, wt: string): void => {
  for (const args of plan.git) git(args, root);
  if (plan.link) symlinkSync(plan.link, join(wt, "node_modules"));
};

export const create = (name: string, sha?: string, cwd: string = process.cwd()): string => {
  validateName(name);
  if (name.startsWith("skeptic-") && !sha) {
    throw new Error("a skeptic-* sandbox requires an explicit sha: the PR head is resolved per round, and defaulting to this tree's HEAD would attribute a whole report to a commit that was never run (#575)");
  }
  const at = sha ?? readHead(cwd);
  const root = resolveRoot(cwd);
  const wt = sandboxPath(root, name);
  run(createPlan(wt, at, haveCommit(root, at)), root, wt);
  return wt;
};

export const teardown = (name: string, cwd: string = process.cwd()): void => {
  const root = resolveRoot(cwd);
  const wt = sandboxPath(root, name);
  run(teardownPlan(wt), root, wt);
};

export const listing = (dir: string): string[] => {
  const out: string[] = [];
  const walk = (at: string): void => {
    for (const entry of readdirSync(at, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      if (SKIP.has(entry.name)) continue;
      const full = join(at, entry.name);
      if (relative(dir, full) === SANDBOX_ROOT) continue;
      if (entry.isDirectory()) walk(full);
      else out.push(relative(dir, full));
    }
  };
  walk(dir);
  return out;
};

export const sandboxes = (cwd: string = process.cwd()): string[] => {
  try {
    return readdirSync(join(resolveRoot(cwd), SANDBOX_ROOT), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
};

export const snapshot = (out: string, cwd: string = process.cwd()): number => {
  const rows = listing(resolveTree(cwd));
  writeFileSync(out, rows.join("\n") + "\n");
  return rows.length;
};

const USAGE = "usage: agent-sandbox create <name> [sha] | teardown <name> | snapshot <outfile> | list";

export const main = (argv: string[]): number => {
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
    console.log(snapshot(first));
    return 0;
  }
  if (command === "list") {
    for (const name of sandboxes()) console.log(name);
    return 0;
  }
  console.error(USAGE);
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
