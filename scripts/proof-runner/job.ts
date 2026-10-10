import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BUDGET_SECONDS, type E2eCheck, type FileCheck, type Job, type Plan } from "./list.ts";
import { e2eOutcome, lintOutcome, unitOutcome, type FileOutcome, type Red, type Stop } from "./outcome.ts";

export type Ran = { status: number | null; stdout: string; stderr: string; budget: boolean; seconds: number };
export type RunOptions = { cwd: string; env?: Readonly<Record<string, string>>; budgetMs: number };
export type Runner = (cmd: string, args: readonly string[], options: RunOptions) => Promise<Ran>;

export type CheckResult = {
  kind: "unit" | "lint" | "e2e";
  expect: string[];
  reds: Red[];
  loadFailures: string[];
  stops: Stop[];
  budget: boolean;
  broken: string | null;
  exit: number | null;
  seconds: number;
  tail: string;
};

export type JobResult = {
  index: number;
  id: string;
  error: string | null;
  applied: boolean | null;
  applyError: string;
  checks: CheckResult[];
  seconds: number;
};

export type JobDeps = { run: Runner; reporter: string; tmp: string };

const TAIL_CHARS = 4000;
const GIT_MS = 60_000;
const AFTER_KILL_MS = 5_000;

export const runBudgeted: Runner = (cmd, args, options) =>
  new Promise((settle) => {
    const started = Date.now();
    const env: Record<string, string | undefined> = { ...process.env, ...options.env };
    delete env["NODE_TEST_CONTEXT"]; // an outer node --test sets it, and a node --test run under it reports to that parent instead of to its own reporter
    const child = spawn(cmd, args, { cwd: options.cwd, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let budget = false;
    let done = false;
    const finish = (status: number | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      settle({ status, stdout, stderr, budget, seconds: Math.round((Date.now() - started) / 100) / 10 });
    };
    child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString()));
    child.on("error", (err) => {
      stderr += String(err);
      finish(null);
    });
    child.on("close", (code) => finish(code));
    const timer = setTimeout(() => {
      budget = true;
      try {
        if (child.pid !== undefined) process.kill(-child.pid, "SIGKILL");
      } catch {}
      setTimeout(() => finish(null), AFTER_KILL_MS).unref();
    }, options.budgetMs);
  });

const tail = (ran: Ran): string => `${ran.stdout}\n${ran.stderr}`.trim().slice(-TAIL_CHARS);
const budgetMs = (check: { budgetSeconds?: number }, kind: keyof typeof BUDGET_SECONDS): number =>
  (check.budgetSeconds ?? BUDGET_SECONDS[kind]) * 1000;

const fileResult = (kind: "unit" | "lint", check: FileCheck, ran: Ran, o: FileOutcome): CheckResult => ({
  kind,
  expect: check.expect,
  reds: o.reds,
  loadFailures: o.loadFailures,
  stops: [],
  budget: ran.budget,
  broken: ran.budget ? null : o.broken,
  exit: ran.status,
  seconds: ran.seconds,
  tail: tail(ran),
});

const unitCheck = async (index: number, check: FileCheck, tree: string, deps: JobDeps): Promise<CheckResult> => {
  const dest = join(deps.tmp, `unit-${index}.jsonl`);
  rmSync(dest, { force: true });
  const args = ["--test", `--test-reporter=${deps.reporter}`, `--test-reporter-destination=${dest}`, ...check.files];
  const ran = await deps.run(process.execPath, args, { cwd: tree, budgetMs: budgetMs(check, "unit") });
  const jsonl = existsSync(dest) ? readFileSync(dest, "utf8") : "";
  return fileResult("unit", check, ran, unitOutcome(jsonl, check.files, tree, ran.status));
};

const lintCheck = async (check: FileCheck, tree: string, deps: JobDeps): Promise<CheckResult> => {
  const args = ["--flag", "unstable_native_nodejs_ts_config", "--format", "json", ...check.files];
  const ran = await deps.run(join(tree, "node_modules", ".bin", "eslint"), args, {
    cwd: tree,
    budgetMs: budgetMs(check, "lint"),
  });
  return fileResult("lint", check, ran, lintOutcome(ran.stdout, tree, ran.status));
};

const e2eCheck = async (check: E2eCheck, tree: string, deps: JobDeps): Promise<CheckResult> => {
  const base = { kind: "e2e" as const, expect: check.expect, reds: [], loadFailures: [], stops: [] };
  const build = await deps.run("npm", ["run", "build"], { cwd: tree, budgetMs: BUDGET_SECONDS.build * 1000 });
  if (build.budget || build.status !== 0) {
    const broken = build.budget ? null : `the build failed (exit ${build.status})`;
    return { ...base, budget: build.budget, broken, exit: build.status, seconds: build.seconds, tail: tail(build) };
  }
  const env = { VELLUM_E2E_SUITES: check.suites, VELLUM_REQUIRE_BROWSER: "1" };
  const ran = await deps.run(process.execPath, ["e2e/run.ts"], { cwd: tree, env, budgetMs: budgetMs(check, "e2e") });
  const o = e2eOutcome(ran.stdout, ran.stderr, ran.status);
  const reds = o.reds.map((name) => ({ name, file: "" }));
  return {
    ...base,
    reds,
    stops: o.stops,
    budget: ran.budget,
    broken: ran.budget ? null : o.broken,
    exit: ran.status,
    seconds: build.seconds + ran.seconds,
    tail: tail(ran),
  };
};

export const runJob = async (index: number, job: Job, sha: string, tree: string, deps: JobDeps): Promise<JobResult> => {
  const started = Date.now();
  const finish = (more: Partial<JobResult>): JobResult => ({
    index,
    id: job.id,
    error: null,
    applied: null,
    applyError: "",
    checks: [],
    ...more,
    seconds: Math.round((Date.now() - started) / 1000),
  });
  const git = (args: string[]) => deps.run("git", args, { cwd: tree, budgetMs: GIT_MS });
  const head = (await git(["rev-parse", "HEAD"])).stdout.trim();
  const status = (await git(["status", "--porcelain"])).stdout.trim();
  if (head !== sha || status !== "")
    return finish({ error: `the tree was not clean at ${sha}: HEAD is ${head}, status ${JSON.stringify(status)}` });
  let applied: boolean | null = null;
  if (job.patch !== undefined) {
    const file = join(deps.tmp, `patch-${index}.diff`);
    writeFileSync(file, job.patch);
    const check = await git(["apply", "--check", file]);
    if (check.status !== 0) return finish({ applied: false, applyError: check.stderr.trim() });
    const apply = await git(["apply", file]);
    if (apply.status !== 0) return finish({ applied: false, applyError: apply.stderr.trim() });
    applied = true;
  }
  const checks: CheckResult[] = [];
  if (job.unit) checks.push(await unitCheck(index, job.unit, tree, deps));
  if (job.lint) checks.push(await lintCheck(job.lint, tree, deps));
  if (job.e2e) checks.push(await e2eCheck(job.e2e, tree, deps));
  return finish({ applied, checks });
};

const jobMain = async (): Promise<void> => {
  const plan = JSON.parse(readFileSync(process.env["PLAN"] ?? "plan.json", "utf8")) as Plan;
  const index = Number(process.env["INDEX"]);
  const job = plan.jobs[index];
  if (job === undefined) throw new Error(`the plan has no job ${process.env["INDEX"]}`);
  const out = process.env["OUT"] ?? "result";
  mkdirSync(out, { recursive: true });
  const deps = {
    run: runBudgeted,
    reporter: join(import.meta.dirname, "reporter.ts"),
    tmp: mkdtempSync(join(tmpdir(), "proof-runner-")),
  };
  const result = await runJob(index, job, plan.sha, process.cwd(), deps).catch((err: unknown): JobResult => ({
    index,
    id: job.id,
    error: `the job failed: ${String(err)}`,
    applied: null,
    applyError: "",
    checks: [],
    seconds: 0,
  }));
  writeFileSync(join(out, `${index}.json`), JSON.stringify(result, null, 2));
  const summary = result.checks.map(
    (c) =>
      `${c.kind}: reds [${c.reds.map((r) => r.name).join(", ")}]${c.stops.length ? ` stops [${c.stops.map((s) => s.id).join(", ")}]` : ""}${c.budget ? " BUDGET" : ""}${c.broken ? ` broken: ${c.broken}` : ""}`,
  );
  console.log(
    `${job.id}: applied ${result.applied}${result.applyError ? ` (${result.applyError})` : ""}${result.error ? ` error: ${result.error}` : ""}; ${summary.join("; ")}`,
  );
};

if (import.meta.main) await jobMain();
