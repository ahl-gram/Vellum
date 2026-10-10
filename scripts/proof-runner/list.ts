import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, normalize } from "node:path";

export const LIST_FILE = "proof.json";
export const BRANCH_PREFIX = "proof/";
export const MAX_JOBS = 256;
export const BUDGET_SECONDS = { unit: 300, lint: 300, build: 300, e2e: 600 } as const;
const WIDE_SELECTIONS = new Set(["", "full", "all", "smoke"]);
const LOCKED = new Set(["package.json", "package-lock.json"]);
const ID = /^[A-Za-z0-9._-]{1,80}$/;

export type FileCheck = { files: string[]; expect: string[]; budgetSeconds?: number };
export type E2eCheck = { suites: string; expect: string[]; budgetSeconds?: number };
export type Entry = { id: string; patch?: string; unit?: FileCheck; lint?: FileCheck; e2e?: E2eCheck };
export type List = { version: 1; sha: string; entries: Entry[] };
export type ControlKind = "unit" | "lint" | "e2e";
export type Job = Entry & { control?: ControlKind };
export type Plan = { sha: string; jobs: Job[] };
export const CHECK_KINDS = ["unit", "lint", "e2e"] as const;

export const selectionKey = (suites: string): string =>
  suites
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s !== "")
    .sort()
    .join(",");

export const patchPaths = (patch: string): string[] =>
  [...patch.matchAll(/^(?:---|\+\+\+) (.+)$/gm)]
    .map((m) => m[1]!.trim())
    .filter((p) => p !== "/dev/null")
    .map((p) => (/^[ab]\//.test(p) ? p.slice(2) : p));

const outside = (path: string): boolean => {
  const n = normalize(path);
  return isAbsolute(path) || n === ".." || n.startsWith("../");
};

const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === "string" && s !== "");

const checkProblems = (id: string, kind: (typeof CHECK_KINDS)[number], raw: unknown, patched: boolean): string[] => {
  if (typeof raw !== "object" || raw === null) return [`"${id}": its ${kind} check is not an object`];
  const check = raw as Record<string, unknown>;
  const problems: string[] = [];
  const expect = check["expect"];
  if (!strings(expect)) problems.push(`"${id}": its ${kind} check's expect is not a list of names`);
  const expected = Array.isArray(expect) ? expect.length : 0;
  if (patched && expected === 0)
    problems.push(`"${id}": its ${kind} check expects no red, so the mutation names nothing it breaks`);
  if (!patched && expected > 0) problems.push(`"${id}" has no patch, so its ${kind} check must expect no red`);
  const budget = check["budgetSeconds"];
  if (
    budget !== undefined &&
    !(Number.isInteger(budget) && (budget as number) > 0 && (budget as number) <= BUDGET_SECONDS[kind])
  )
    problems.push(
      `"${id}": its ${kind} budget must be a whole number of seconds from 1 to the default ${BUDGET_SECONDS[kind]}`,
    );
  if (kind === "e2e") {
    const suites = check["suites"];
    if (typeof suites !== "string" || WIDE_SELECTIONS.has(suites.trim().toLowerCase()))
      problems.push(`"${id}" selects ${JSON.stringify(suites)}; a proof must name the suites it runs`);
  } else {
    const files = check["files"];
    if (!strings(files) || files.length === 0) problems.push(`"${id}": its ${kind} check names no files`);
    else for (const f of files.filter(outside)) problems.push(`"${id}": ${f} is outside the tree`);
  }
  return problems;
};

const patchProblems = (id: string, patch: unknown, lint: boolean): string[] => {
  if (typeof patch !== "string" || patch.trim() === "") return [`"${id}": its patch is empty or not text`];
  const problems = patchPaths(patch).flatMap((p) => [
    ...(outside(p) ? [`"${id}": the patch touches ${p}, outside the tree`] : []),
    ...(LOCKED.has(normalize(p)) ? [`"${id}": the patch touches ${p}, but the install runs before the patch`] : []),
  ]);
  if (lint && /^--- \/dev\/null$/m.test(patch))
    problems.push(
      `"${id}": a lint plant goes in an existing file; a new file fails the lint's project service before any rule runs`,
    );
  return problems;
};

const entryProblems = (raw: unknown, seen: Set<string>): string[] => {
  if (typeof raw !== "object" || raw === null) return ["an entry is not an object"];
  const e = raw as Record<string, unknown>;
  const id = typeof e["id"] === "string" ? e["id"] : JSON.stringify(e["id"]);
  const problems: string[] = [];
  if (!ID.test(id)) problems.push(`id "${id}" is not 1 to 80 letters, digits, dots, dashes or underscores`);
  else if (id.startsWith("control-")) problems.push(`"${id}": ids starting control- are reserved for the controls`);
  if (seen.has(id)) problems.push(`duplicate id "${id}"`);
  seen.add(id);
  const patched = e["patch"] !== undefined;
  const kinds = CHECK_KINDS.filter((k) => e[k] !== undefined);
  if (kinds.length === 0) problems.push(`"${id}" names no check`);
  for (const k of kinds) problems.push(...checkProblems(id, k, e[k], patched));
  if (patched) problems.push(...patchProblems(id, e["patch"], kinds.includes("lint")));
  return problems;
};

export const parseList = (raw: unknown): List => {
  const l = (raw ?? {}) as Record<string, unknown>;
  const problems: string[] = [];
  if (l["version"] !== 1) problems.push("the list's version is not 1");
  if (typeof l["sha"] !== "string" || !/^[0-9a-f]{40}$/.test(l["sha"]))
    problems.push("the list's sha is not a full commit sha");
  const entries = Array.isArray(l["entries"]) ? (l["entries"] as unknown[]) : [];
  if (entries.length === 0) problems.push("the list has no entries");
  const seen = new Set<string>();
  for (const e of entries) problems.push(...entryProblems(e, seen));
  if (problems.length > 0) throw new Error(`the proof list is refused:\n- ${problems.join("\n- ")}`);
  return raw as List;
};

const union = (lists: string[][]): string[] => [...new Set(lists.flat())].sort();

export const planJobs = (list: List): Plan => {
  const selections = new Map<string, string>();
  for (const e of list.entries)
    if (e.e2e && !selections.has(selectionKey(e.e2e.suites))) selections.set(selectionKey(e.e2e.suites), e.e2e.suites);
  const controls: Job[] = [...selections.values()].map((suites, i) => ({
    id: `control-e2e-${i + 1}`,
    control: "e2e",
    e2e: { suites, expect: [] },
  }));
  for (const kind of ["lint", "unit"] as const) {
    const files = list.entries.flatMap((e) => (e[kind] ? [e[kind].files] : []));
    const check = { files: union(files), expect: [] };
    if (files.length > 0)
      controls.push(
        kind === "lint"
          ? { id: "control-lint", control: kind, lint: check }
          : { id: "control-unit", control: kind, unit: check },
      );
  }
  const jobs = [...list.entries, ...controls];
  if (jobs.length > MAX_JOBS)
    throw new Error(
      `the list plans ${jobs.length} jobs counting its controls, past GitHub's ${MAX_JOBS} per run; split it into two sends`,
    );
  return { sha: list.sha, jobs };
};

export const planFromCheckout = (dir: string, refName: string): Plan => {
  if (!refName.startsWith(BRANCH_PREFIX))
    throw new Error(`a proof runs only from a ${BRANCH_PREFIX} branch, not ${refName}`);
  const changed = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
    cwd: dir,
    encoding: "utf8",
    timeout: 30_000,
  })
    .split("\n")
    .filter((l) => l !== "");
  if (changed.length !== 1 || changed[0] !== LIST_FILE)
    throw new Error(`the list's commit must add ${LIST_FILE} and nothing else, but it changes ${changed.join(", ")}`);
  return planJobs(parseList(JSON.parse(readFileSync(join(dir, LIST_FILE), "utf8"))));
};

const planMain = (): void => {
  const plan = planFromCheckout(process.cwd(), process.env["REF_NAME"] ?? "");
  writeFileSync(process.env["PLAN"] ?? "plan.json", JSON.stringify(plan));
  const matrix = { include: plan.jobs.map((j, index) => ({ index, id: j.id })) };
  const out = process.env["GITHUB_OUTPUT"];
  if (out) appendFileSync(out, `matrix=${JSON.stringify(matrix)}\nsha=${plan.sha}\n`);
  console.log(`planned ${plan.jobs.length} jobs at ${plan.sha}: ${plan.jobs.map((j) => j.id).join(", ")}`);
};

if (import.meta.main) planMain();
