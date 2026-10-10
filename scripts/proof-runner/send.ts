import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { BRANCH_PREFIX, LIST_FILE, parseList, type E2eCheck, type Entry, type FileCheck, type List } from "./list.ts";

export type Edit =
  | { file: string; find: string; replace: string }
  | { file: string; line: number; from: string; to: string }
  | { file: string; append: string };
export type Mutation = {
  id: string;
  patch?: string;
  edits?: Edit[];
  unit?: FileCheck;
  lint?: FileCheck;
  e2e?: E2eCheck;
};
export type SuiteRules = {
  order: readonly string[];
  predecessor: Readonly<Partial<Record<string, string>>>;
  opensOnHome: readonly string[];
};

const GIT_MS = 30_000;
const count = (text: string, part: string): number => text.split(part).length - 1;

const applyOne = (text: string, edit: Edit): string => {
  if ("append" in edit) return text + edit.append;
  if ("find" in edit) {
    const n = count(text, edit.find);
    if (n !== 1) throw new Error(`${edit.file}: ${JSON.stringify(edit.find)} found ${n} times, not once`);
    if (edit.find === edit.replace) throw new Error(`${edit.file}: the replacement is the text it replaces`);
    return text.replace(edit.find, () => edit.replace);
  }
  const lines = text.split("\n");
  if (!Number.isInteger(edit.line) || edit.line < 1 || edit.line > lines.length)
    throw new Error(`${edit.file}: line ${edit.line} is not one of its ${lines.length} lines`);
  const before = lines[edit.line - 1]!;
  const n = count(before, edit.from);
  if (n !== 1 || edit.from === "")
    throw new Error(`${edit.file}:${edit.line} holds ${JSON.stringify(edit.from)} ${n} times, not once`);
  if (edit.from === edit.to) throw new Error(`${edit.file}:${edit.line}: the replacement is the text it replaces`);
  lines[edit.line - 1] = before.replace(edit.from, () => edit.to);
  return lines.join("\n");
};

export const applyEdits = (read: (file: string) => string, edits: readonly Edit[]): Map<string, string> => {
  const after = new Map<string, string>();
  for (const edit of edits) after.set(edit.file, applyOne(after.get(edit.file) ?? read(edit.file), edit));
  return after;
};

const withTmp = <T>(body: (dir: string) => T): T => {
  const dir = mkdtempSync(join(tmpdir(), "proof-runner-send-"));
  try {
    return body(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export const diffFor = (before: ReadonlyMap<string, string>, after: ReadonlyMap<string, string>): string =>
  withTmp((dir) =>
    [...after.keys()]
      .map((path) => {
        const old = before.get(path);
        if (old === undefined)
          throw new Error(`${path} has no text before the edit, and an edit changes an existing file`);
        for (const [side, text] of [
          ["a", old],
          ["b", after.get(path)!],
        ] as const) {
          mkdirSync(dirname(join(dir, side, path)), { recursive: true });
          writeFileSync(join(dir, side, path), text);
        }
        const r = spawnSync("git", ["diff", "--no-index", "--no-prefix", `a/${path}`, `b/${path}`], {
          cwd: dir,
          encoding: "utf8",
          timeout: GIT_MS,
        });
        if (r.status !== 0 && r.status !== 1) throw new Error(`git diff failed on ${path}: ${r.stderr}`);
        return r.stdout;
      })
      .join(""),
  );

export const appliesAt = (repo: string, sha: string, patch: string): string | null =>
  withTmp((dir) => {
    const env = { ...process.env, GIT_INDEX_FILE: join(dir, "index") };
    const read = spawnSync("git", ["read-tree", sha], { cwd: repo, env, encoding: "utf8", timeout: GIT_MS });
    if (read.status !== 0) return `the commit ${sha} could not be read: ${read.stderr.trim()}`;
    writeFileSync(join(dir, "patch.diff"), patch);
    const check = spawnSync("git", ["apply", "--cached", "--check", join(dir, "patch.diff")], {
      cwd: repo,
      env,
      encoding: "utf8",
      timeout: GIT_MS,
    });
    return check.status === 0 ? null : check.stderr.trim() || `git apply exited ${check.status}`;
  });

export const orderProblems = (suites: string, rules: SuiteRules): string[] => {
  const names = suites
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s !== "");
  const problems = names.filter((n) => !rules.order.includes(n)).map((n) => `no suite named ${n}`);
  for (const n of names) {
    const before = rules.predecessor[n];
    if (before !== undefined && !names.includes(before))
      problems.push(`${n} needs ${before} to run before it, and the selection leaves it out`);
  }
  const ordered = rules.order.filter((n) => names.includes(n));
  ordered.forEach((n, i) => {
    if (i > 0 && ordered[i - 1] === "home" && rules.opensOnHome.includes(n))
      problems.push(`${n} opens on home's page, so it cannot run straight after home (settle-doctrine clause 9)`);
  });
  return problems;
};

export const branchBodies = {
  blob: (content: string) => ({ content, encoding: "utf-8" }),
  tree: (baseTree: string, blob: string) => ({
    base_tree: baseTree,
    tree: [{ path: LIST_FILE, mode: "100644", type: "blob", sha: blob }],
  }),
  commit: (tree: string, parent: string, label: string) => ({
    message: `proof list ${label}`,
    tree,
    parents: [parent],
  }),
  ref: (label: string, commit: string) => ({ ref: `refs/heads/${BRANCH_PREFIX}${label}`, sha: commit }),
};

export type Built = { list: List | null; errors: string[]; warnings: string[] };
export type BuildDeps = {
  repo: string;
  read: (file: string) => string;
  rules: SuiteRules;
  readPatch?: (path: string) => string;
};

const entryFor = (m: Mutation, sha: string, deps: BuildDeps, warnings: string[]): Entry => {
  const checks = { ...(m.unit && { unit: m.unit }), ...(m.lint && { lint: m.lint }), ...(m.e2e && { e2e: m.e2e }) };
  if (m.patch !== undefined) {
    const patch = (deps.readPatch ?? ((p: string) => readFileSync(p, "utf8")))(m.patch);
    const stale = appliesAt(deps.repo, sha, patch);
    if (stale !== null)
      warnings.push(`"${m.id}": its patch does not apply at ${sha}, and the ledger will say so: ${stale}`);
    return { id: m.id, patch, ...checks };
  }
  if (m.edits === undefined) return { id: m.id, ...checks };
  const after = applyEdits(deps.read, m.edits);
  const patch = diffFor(new Map([...after.keys()].map((f) => [f, deps.read(f)])), after);
  const stale = appliesAt(deps.repo, sha, patch);
  if (stale !== null) throw new Error(`its compiled patch does not apply at ${sha}: ${stale}`);
  return { id: m.id, patch, ...checks };
};

export const buildList = (mutations: readonly Mutation[], sha: string, deps: BuildDeps): Built => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entries: Entry[] = [];
  for (const m of mutations) {
    try {
      entries.push(entryFor(m, sha, deps, warnings));
    } catch (err) {
      errors.push(`"${m.id}": ${err instanceof Error ? err.message : String(err)}`);
    }
    if (m.e2e) errors.push(...orderProblems(m.e2e.suites, deps.rules).map((p) => `"${m.id}": ${p}`));
  }
  if (errors.length > 0) return { list: null, errors, warnings };
  try {
    return { list: parseList({ version: 1, sha, entries }), errors, warnings };
  } catch (err) {
    return { list: null, errors: [err instanceof Error ? err.message : String(err)], warnings };
  }
};
