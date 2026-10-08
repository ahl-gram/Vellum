import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** The sandbox lifecycle a dispatched review agent needs, in one reviewed place: Issue #575 is what four hand-retyped copies of it cost. The git argv is returned as data by the *Plan functions so a test can pin which commands run, which is the only way to pin the absence of one. */

const SANDBOX_NAME = /^(guard|skeptic)-[A-Za-z0-9._-]+$/;
const GIT_TIMEOUT_MS = 120_000;
const GIT_MAX_BYTES = 64 * 1024 * 1024; // 2026-09-27: the largest tracked file is 8.3 MB (design/chart-table/explorer.html), and a blob read past this throws rather than truncating
const SKIP = new Set([".git", "node_modules"]);
const SANDBOX_ROOT = join(".claude", "worktrees");
const LINK = join("..", "..", "..", "node_modules");
const REGULAR_MODES = new Set(["100644", "100755"]);

export type Plan = { git: string[][]; link?: string };

const gitBytes = (args: string[], cwd: string): Buffer =>
  execFileSync("git", args, { cwd, timeout: GIT_TIMEOUT_MS, maxBuffer: GIT_MAX_BYTES });

const git = (args: string[], cwd: string): string => gitBytes(args, cwd).toString("utf8").trim();

export const validateName = (name: string): string => {
  if (!SANDBOX_NAME.test(name)) {
    throw new Error(
      `sandbox name ${JSON.stringify(name)} is outside the guard-* and skeptic-* namespace this script may address. Note what that does and does not buy: it keeps the script inside the sandbox namespace, so it cannot reach a session's own worktree, but it is a namespace and not provenance, so a concurrent review agent's sandbox of the same shape is still addressable.`,
    );
  }
  return name;
};

export const resolveRoot = (cwd: string = process.cwd()): string =>
  dirname(git(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd));

export const resolveTree = (cwd: string = process.cwd()): string => git(["rev-parse", "--show-toplevel"], cwd);

export const sandboxPath = (root: string, name: string): string =>
  join(root, ".claude", "worktrees", validateName(name));

export const readHead = (cwd: string = process.cwd()): string => git(["rev-parse", "HEAD"], cwd);

const haveCommit = (root: string, sha: string): boolean => {
  try {
    execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], {
      cwd: root,
      encoding: "utf8",
      timeout: GIT_TIMEOUT_MS,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
};

export const createPlan = (wt: string, sha: string, hasCommit: boolean): Plan => ({
  git: [...(hasCommit ? [] : [["fetch", "origin"]]), ["worktree", "add", "--detach", wt, sha]],
  link: LINK,
});

export const teardownPlan = (wt: string): Plan => ({ git: [["worktree", "remove", "--force", wt]] });

const run = (plan: Plan, root: string, wt: string): void => {
  for (const args of plan.git) git(args, root);
  if (plan.link) symlinkSync(plan.link, join(wt, "node_modules"));
};

export const create = (name: string, sha?: string, cwd: string = process.cwd()): string => {
  validateName(name);
  if (name.startsWith("skeptic-") && !sha) {
    throw new Error(
      "a skeptic-* sandbox requires an explicit sha: the PR head is resolved per round, and defaulting to this tree's HEAD would attribute a whole report to a commit that was never run (#575)",
    );
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
    for (const entry of readdirSync(at, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    )) {
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
  const dir = join(resolveRoot(cwd), SANDBOX_ROOT);
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
};

export const snapshot = (out: string, cwd: string = process.cwd()): number => {
  const rows = listing(resolveTree(cwd));
  writeFileSync(out, rows.join("\n") + "\n");
  return rows.length;
};

const guardSandbox = (name: string, cwd: string): string => {
  if (!validateName(name).startsWith("guard-")) {
    throw new Error(
      `${name} is not a guard-* sandbox: only the guard prover changes or compares a sandbox's files, and a skeptic's sandbox is read-only`,
    );
  }
  return sandboxPath(resolveRoot(cwd), name);
};

const sandboxCommit = (wt: string): string => {
  const pointer = /^gitdir: (.+)$/m.exec(readFileSync(join(wt, ".git"), "utf8"));
  const dir = pointer?.[1];
  const head = dir ? readFileSync(join(resolve(wt, dir), "HEAD"), "utf8").trim() : "";
  if (!/^[0-9a-f]{40,64}$/.test(head)) {
    throw new Error(
      `${wt} is not a sandbox at a detached commit (its HEAD reads ${JSON.stringify(head)}), so there is no commit to compare against or restore from`,
    );
  }
  return head;
};

const trackedFile = (sha: string, path: string, cwd: string): string => {
  const rel = normalize(path);
  const outside = isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`);
  const [entry = ""] = outside
    ? []
    : gitBytes(["ls-tree", "--full-tree", "-z", sha, "--", rel], cwd).toString("utf8").split("\0");
  if (entry.slice(entry.indexOf("\t") + 1) !== rel || !REGULAR_MODES.has(entry.split(" ")[0] ?? "")) {
    throw new Error(`${path} is not a regular file tracked at ${sha}, so the sandbox could not put it back`);
  }
  return rel;
};

const containedFile = (wt: string, rel: string): string => {
  const file = join(wt, rel);
  const link = lstatSync(file, { throwIfNoEntry: false })?.isSymbolicLink() ?? false;
  if (link || !`${realpathSync(dirname(file))}${sep}`.startsWith(`${realpathSync(wt)}${sep}`)) {
    throw new Error(
      `${rel} leads outside the sandbox through a symlink, so writing it would change a tree the sandbox does not own`,
    );
  }
  return file;
};

export const mutate = (
  name: string,
  path: string,
  line: number,
  from: string,
  to: string,
  cwd: string = process.cwd(),
): string => {
  const wt = guardSandbox(name, cwd);
  const rel = trackedFile(sandboxCommit(wt), path, cwd);
  const file = containedFile(wt, rel);
  if (from === "") throw new Error("the anchor is empty, and an empty anchor matches between every character");
  if (from === to)
    throw new Error(
      `the anchor and the replacement are the same, so the mutation changes nothing and its green run would read as a HOLE`,
    );
  const raw = readFileSync(file);
  const text = raw.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(raw))
    throw new Error(
      `${rel} is not valid UTF-8, so rewriting it would change bytes on lines the mutation does not name`,
    );
  const lines = text.split("\n");
  if (!Number.isInteger(line) || line < 1 || line > lines.length)
    throw new Error(`line ${line} is not a line of ${rel}, which has ${lines.length}`);
  const before = lines[line - 1] ?? "";
  const count = before.split(from).length - 1;
  if (count !== 1)
    throw new Error(
      `${rel}:${line} holds ${JSON.stringify(from)} ${count} times, not once, so the mutation would not name one site`,
    );
  const after = before.replace(from, () => to);
  writeFileSync(file, [...lines.slice(0, line - 1), after, ...lines.slice(line)].join("\n"));
  return `${rel}:${line}\n- ${before}\n+ ${after}`;
};

export const restore = (name: string, paths: string[], cwd: string = process.cwd()): string[] => {
  const wt = guardSandbox(name, cwd);
  const sha = sandboxCommit(wt);
  const targets = paths.map((path) => {
    const rel = trackedFile(sha, path, cwd);
    return { rel, file: containedFile(wt, rel) };
  });
  for (const { rel, file } of targets) writeFileSync(file, gitBytes(["cat-file", "blob", `${sha}:${rel}`], cwd));
  return targets.map((t) => t.rel);
};

const differs = (wt: string, entry: string): boolean => {
  const tab = entry.indexOf("\t");
  const [, type, id = ""] = entry.slice(0, tab).split(" ");
  if (type !== "blob") return false;
  const file = join(wt, entry.slice(tab + 1));
  const stat = lstatSync(file, { throwIfNoEntry: false });
  if (!stat || !(stat.isFile() || stat.isSymbolicLink())) return true;
  const bytes = stat.isSymbolicLink() ? Buffer.from(readlinkSync(file)) : readFileSync(file);
  const hash = createHash(id.length === 64 ? "sha256" : "sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes);
  return hash.digest("hex") !== id;
};

export const status = (name: string, cwd: string = process.cwd()): string[] => {
  const wt = guardSandbox(name, cwd);
  const entries = gitBytes(["ls-tree", "--full-tree", "-r", "-z", sandboxCommit(wt)], cwd)
    .toString("utf8")
    .split("\0")
    .filter((e) => e !== "");
  return entries.filter((entry) => differs(wt, entry)).map((entry) => entry.slice(entry.indexOf("\t") + 1));
};

const USAGE =
  "usage: agent-sandbox create <name> [sha] | teardown <name> | snapshot <outfile> | list | mutate <name> <path> <line> <from> <to> | restore <name> <path>... | status <name>";

export const main = (argv: string[]): number => {
  const [command, first = "", second, line = "", from = "", to = ""] = argv;
  if (command === "mutate" && argv.length === 6) {
    console.log(mutate(first, second ?? "", Number(line), from, to));
    return 0;
  }
  if (command === "restore" && argv.length > 2) {
    for (const path of restore(first, argv.slice(2))) console.log(path);
    return 0;
  }
  if (command === "status" && argv.length === 2) {
    const changed = status(first);
    for (const path of changed) console.log(path);
    return changed.length > 0 ? 1 : 0;
  }
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
