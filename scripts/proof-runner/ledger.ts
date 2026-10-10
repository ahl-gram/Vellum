import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { CheckResult, JobResult } from "./job.ts";
import { CHECK_KINDS, selectionKey, type Job, type Plan } from "./list.ts";

export const VERDICTS = [
  "NOT APPLIED",
  "UNPROVEN",
  "INCONCLUSIVE",
  "HOLE",
  "IMPRECISE",
  "NEEDS READ",
  "BITES",
] as const;
export type Verdict = (typeof VERDICTS)[number] | "CLEAN" | "RED";
type Kind = (typeof CHECK_KINDS)[number];
export type CheckRow = {
  kind: Kind;
  target: string;
  expect: string[];
  actual: string[];
  verdict: Verdict;
  note: string;
};
export type Row = {
  index: number;
  id: string;
  role: "mutation" | "sample" | "control";
  verdict: Verdict;
  checks: CheckRow[];
  note: string;
  stanzas: string[];
  seconds: number | null;
};
type Controls = (kind: Kind, job: Job) => { job: Job; result: JobResult | undefined } | undefined;

const NO_RESULT = "no result: the job timed out, was cancelled or failed before writing one";
const SAMPLE_ORDER: readonly Verdict[] = ["UNPROVEN", "RED", "CLEAN"];
const worst = (verdicts: readonly Verdict[], order: readonly Verdict[]): Verdict =>
  order.find((v) => verdicts.includes(v)) ?? order[order.length - 1]!;
const names = (c: CheckResult): string[] => [...new Set(c.reds.map((r) => r.name))];
const sameSet = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && [...a].sort().join("\n") === [...b].sort().join("\n");

const filesOf = (job: Job, kind: Kind): string[] => (kind === "e2e" ? [] : (job[kind]?.files ?? []));
const targetOf = (job: Job, kind: Kind): string =>
  kind === "e2e" ? (job.e2e?.suites ?? "") : filesOf(job, kind).join(", ");

const controlDirt = (job: Job, kind: Kind, controls: Controls): string | null => {
  const control = controls(kind, job);
  if (control?.result === undefined) return "its control has no result";
  const c = control.result.checks.find((x) => x.kind === kind);
  if (c === undefined) return "its control recorded no check";
  if (control.result.error !== null) return `its control could not start: ${control.result.error}`;
  if (c.budget) return "its control ran past its budget";
  if (c.broken !== null) return `its control could not be judged: ${c.broken}`;
  const files = filesOf(job, kind);
  const mine = (file: string) => kind === "e2e" || files.includes(file);
  const dirt = [
    ...c.reds.filter((r) => mine(r.file)).map((r) => r.name),
    ...c.loadFailures.filter(mine),
    ...c.stops.map((s) => s.id),
  ];
  return dirt.length > 0 ? `its control is red on ${dirt.join(", ")}` : null;
};

const mutationCheck = (job: Job, kind: Kind, c: CheckResult | undefined, controls: Controls): CheckRow => {
  const expect = (kind === "e2e" ? job.e2e?.expect : job[kind]?.expect) ?? [];
  const row = (verdict: Verdict, note = "", actual: string[] = []): CheckRow => ({
    kind,
    target: targetOf(job, kind),
    expect,
    actual,
    verdict,
    note,
  });
  if (c === undefined) return row("UNPROVEN", `no result for its ${kind} check`);
  const actual = names(c);
  if (c.budget) return row("UNPROVEN", `ran past its ${kind} budget`, actual);
  const dirt = controlDirt(job, kind, controls);
  if (dirt !== null) return row("INCONCLUSIVE", dirt, actual);
  if (c.broken !== null) return row("INCONCLUSIVE", c.broken, actual);
  if (c.stops.length > 0)
    return row("NEEDS READ", `stopped at ${c.stops.map((s) => `${s.id}: ${s.detail}`).join("; ")}`, actual);
  if (c.loadFailures.length > 0)
    return row("IMPRECISE", `${c.loadFailures.join(", ")} failed before its tests ran`, actual);
  if (sameSet(actual, expect)) return row("BITES", "", actual);
  return row(actual.length === 0 ? "HOLE" : "IMPRECISE", "", actual);
};

const sampleCheck = (job: Job, kind: Kind, c: CheckResult | undefined): CheckRow => {
  const row = (verdict: Verdict, note = "", actual: string[] = []): CheckRow => ({
    kind,
    target: targetOf(job, kind),
    expect: [],
    actual,
    verdict,
    note,
  });
  if (c === undefined) return row("UNPROVEN", `no result for its ${kind} check`);
  const actual = [...names(c), ...c.loadFailures, ...c.stops.map((s) => s.id)];
  if (c.budget) return row("UNPROVEN", `ran past its ${kind} budget`, actual);
  if (c.broken !== null) return row("RED", c.broken, actual);
  return row(actual.length > 0 ? "RED" : "CLEAN", "", actual);
};

const judgeOne = (job: Job, index: number, r: JobResult | undefined, controls: Controls): Row => {
  const role: Row["role"] = job.control !== undefined ? "control" : job.patch !== undefined ? "mutation" : "sample";
  const base = { index, id: job.id, role, checks: [], note: "", stanzas: [], seconds: r?.seconds ?? null };
  if (r === undefined) return { ...base, verdict: "UNPROVEN", note: NO_RESULT };
  if (r.error !== null) return { ...base, verdict: role === "mutation" ? "INCONCLUSIVE" : "RED", note: r.error };
  if (role === "mutation" && r.applied === false) return { ...base, verdict: "NOT APPLIED", note: r.applyError };
  const kinds = CHECK_KINDS.filter((k) => job[k] !== undefined);
  const found = (k: Kind) => r.checks.find((c) => c.kind === k);
  const checks = kinds.map((k) =>
    role === "mutation" ? mutationCheck(job, k, found(k), controls) : sampleCheck(job, k, found(k)),
  );
  const order = role === "mutation" ? VERDICTS : SAMPLE_ORDER;
  const stanzas = r.checks.flatMap((c) => c.stops.map((s) => s.stanza || s.detail));
  const note = checks
    .map((c) => c.note)
    .filter((n) => n !== "")
    .join("; ");
  return {
    ...base,
    verdict: worst(
      checks.map((c) => c.verdict),
      order,
    ),
    checks,
    note,
    stanzas,
  };
};

export const judge = (plan: Plan, results: ReadonlyMap<number, JobResult>): Row[] => {
  const keyOf = (kind: Kind, job: Job) => (kind === "e2e" ? `e2e:${selectionKey(job.e2e?.suites ?? "")}` : kind);
  const controlIndex = new Map<string, number>();
  plan.jobs.forEach((job, i) => {
    if (job.control !== undefined) controlIndex.set(keyOf(job.control, job), i);
  });
  const controls: Controls = (kind, job) => {
    const i = controlIndex.get(keyOf(kind, job));
    return i === undefined ? undefined : { job: plan.jobs[i]!, result: results.get(i) };
  };
  return plan.jobs.map((job, i) => judgeOne(job, i, results.get(i), controls));
};

export const passed = (rows: readonly Row[]): boolean =>
  rows.every((r) => (r.role === "mutation" ? r.verdict === "BITES" : r.verdict === "CLEAN"));

export const codeSpan = (text: string): string =>
  text === "" ? "" : `\`${text.replace(/`/g, "'").replace(/\|/g, "\\|").replace(/\r?\n/g, " ")}\``;

const tableLines = (r: Row): string[] => {
  const head = `| ${r.index} | ${r.id} | ${r.verdict} |`;
  const blank = "| | | |";
  if (r.checks.length === 0) return [`${head} | | | ${codeSpan(r.note)} | ${r.seconds ?? ""} |`];
  return r.checks.map((c, i) =>
    [
      i === 0 ? head : blank,
      ` ${c.kind} ${codeSpan(c.target)} | ${codeSpan(c.expect.join(", "))} | ${codeSpan(c.actual.join(", "))} | ${c.verdict}${c.note ? ` ${codeSpan(c.note)}` : ""} |`,
      ` ${i === 0 ? (r.seconds ?? "") : ""} |`,
    ].join(""),
  );
};

export const ledgerMarkdown = (rows: readonly Row[], meta: Readonly<Record<string, string>>): string => {
  const counts = [...VERDICTS, "CLEAN", "RED"]
    .map((v) => [v, rows.filter((r) => r.verdict === v).length] as const)
    .filter(([, n]) => n > 0)
    .map(([v, n]) => `${v} ${n}`);
  const reads = rows.filter((r) => r.stanzas.length > 0);
  return [
    "# Proof ledger",
    "",
    ...Object.entries(meta).map(([k, v]) => `- ${k}: ${codeSpan(v)}`),
    `- rows: ${rows.length}; ${counts.join(", ")}`,
    `- outcome: ${passed(rows) ? "every mutation BITES and every control is CLEAN" : "NOT every mutation bites, or a control is not clean; read the rows"}`,
    "",
    "| # | id | verdict | check | expected | actual | check verdict | seconds |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.flatMap(tableLines),
    ...(reads.length > 0 ? ["", "## Stops for a reader (Issue #779 comment 6090198881)"] : []),
    ...reads.flatMap((r) => r.stanzas.flatMap((s) => ["", `### ${r.id}`, "", "~~~~", s, "~~~~"])),
    "",
  ].join("\n");
};

const ledgerMain = (): void => {
  const plan = JSON.parse(readFileSync(process.env["PLAN"] ?? "plan.json", "utf8")) as Plan;
  const dir = process.env["RESULTS"] ?? "results";
  const results = new Map<number, JobResult>();
  for (const f of existsSync(dir) ? readdirSync(dir).filter((n) => /^\d+\.json$/.test(n)) : []) {
    const r = JSON.parse(readFileSync(join(dir, f), "utf8")) as JobResult;
    results.set(r.index, r);
  }
  const rows = judge(plan, results);
  const meta = {
    "sha under test": plan.sha,
    "runner ref": process.env["GITHUB_REF_NAME"] ?? "",
    "runner sha": process.env["GITHUB_SHA"] ?? "",
    run: process.env["GITHUB_RUN_ID"] ?? "",
  };
  const md = ledgerMarkdown(rows, meta);
  const out = process.env["OUT"] ?? "ledger";
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "ledger.md"), md);
  writeFileSync(join(out, "ledger.json"), JSON.stringify({ meta, passed: passed(rows), rows }, null, 2));
  const summary = process.env["GITHUB_STEP_SUMMARY"];
  if (summary) appendFileSync(summary, md);
  console.log(md);
  process.exitCode = passed(rows) ? 0 : 1;
};

if (import.meta.main) ledgerMain();
