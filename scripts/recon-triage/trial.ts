import { two } from "../comment-judge/report.ts";
import type { Reply } from "../jev/system-one.ts";
import { isList } from "./claims.ts";
import { bandOf, CONTRADICTS_ID, HOLDS_ID, scoreOf, type Band } from "./questions.ts";

export type TrialRow = {
  readonly issue: number;
  readonly comment_id: number;
  readonly claim: string;
  readonly verdict: "stale" | "current";
  readonly why: string;
  readonly sha: string;
  readonly paths: readonly string[];
  readonly symbols: readonly string[];
  readonly kind: "behavior";
};
export type ScoredRow = { readonly row: TrialRow; readonly holds: number; readonly contradicts: number };

export const FIRST_N = [10, 25, 50, 100] as const;
export const TRIAL_REFERENCE =
  "The trial at jev-1.14.0 (Issue #1310 comment 6782678031): AUC 0.76 (holds), 0.79 (1 - contradicts), 0.79 (mean of both); stale among the first 10, 25, 50, 100: 10, 21, 37, 66.";

const parseRow = (line: string, n: number): TrialRow => {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(`line ${n}: not a JSON object`);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error(`line ${n}: not a JSON object`);
  const { issue, comment_id, claim, verdict, why, sha, paths, symbols, kind } = value as Record<string, unknown>;
  if (!Number.isInteger(issue)) throw new Error(`line ${n}: issue is not a whole number`);
  if (!Number.isInteger(comment_id)) throw new Error(`line ${n}: comment_id is not a whole number`);
  if (typeof claim !== "string" || claim.trim() === "") throw new Error(`line ${n}: claim is missing or empty`);
  if (verdict !== "stale" && verdict !== "current") throw new Error(`line ${n}: verdict is not stale or current`);
  if (typeof why !== "string") throw new Error(`line ${n}: why is not a string`);
  if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) throw new Error(`line ${n}: sha is not a full commit id`);
  if (!isList(paths) || paths.length === 0) throw new Error(`line ${n}: paths is empty or not a list of strings`);
  if (!isList(symbols)) throw new Error(`line ${n}: symbols is not a list of strings`);
  if (kind !== "behavior") throw new Error(`line ${n}: not a behavior claim`);
  return { issue: issue as number, comment_id: comment_id as number, claim, verdict, why, sha, paths, symbols, kind };
};

export const parseTrialSet = (text: string): TrialRow[] =>
  text.split("\n").flatMap((line, i) => (line.trim() === "" ? [] : [parseRow(line, i + 1)]));

export const meanOf = (s: ScoredRow): number => scoreOf(s.holds, s.contradicts);

export const aucOf = (rows: readonly ScoredRow[], feature: (s: ScoredRow) => number): number => {
  const current = rows.filter((s) => s.row.verdict === "current").map(feature);
  const stale = rows.filter((s) => s.row.verdict === "stale").map(feature);
  if (current.length === 0 || stale.length === 0) return NaN;
  let wins = 0;
  for (const c of current) for (const s of stale) wins += c > s ? 1 : c === s ? 0.5 : 0;
  return wins / (current.length * stale.length);
};

export const rankByMean = (rows: readonly ScoredRow[]): ScoredRow[] => [...rows].sort((a, b) => meanOf(a) - meanOf(b));

export const staleAmongFirst = (rows: readonly ScoredRow[], n: number): number =>
  rankByMean(rows)
    .slice(0, n)
    .filter((s) => s.row.verdict === "stale").length;

const figure = (n: number): string => (Number.isNaN(n) ? "n/a" : two(n));

const perIssue = (scored: readonly ScoredRow[]): { average: number; issues: number } => {
  const aucs = [...new Set(scored.map((s) => s.row.issue))]
    .map((issue) =>
      aucOf(
        scored.filter((s) => s.row.issue === issue),
        meanOf,
      ),
    )
    .filter((auc) => !Number.isNaN(auc));
  return { average: aucs.length === 0 ? NaN : aucs.reduce((a, b) => a + b, 0) / aucs.length, issues: aucs.length };
};

const BANDS: readonly Band[] = ["likely stale", "unsettled", "likely current"];

export const scoreLines = (rows: readonly TrialRow[], replies: readonly Reply[]): string[] => {
  const scored: ScoredRow[] = [];
  const reasons: string[] = [];
  const models: string[] = [];
  let notAnswered = 0;
  rows.forEach((row, i) => {
    const reply = replies[i]!;
    if (!reply.ok) {
      notAnswered += 1;
      if (!reasons.includes(reply.reason)) reasons.push(reply.reason);
      return;
    }
    if (!models.includes(reply.model)) models.push(reply.model);
    scored.push({ row, holds: reply.nouls[HOLDS_ID]!, contradicts: reply.nouls[CONTRADICTS_ID]! });
  });
  const stale = scored.filter((s) => s.row.verdict === "stale").length;
  const per = perIssue(scored);
  const first = FIRST_N.map((n) => `first ${n}: ${staleAmongFirst(scored, n)}`).join("; ");
  const baseRate = scored.length === 0 ? "n/a" : ((100 * stale) / scored.length).toFixed(0);
  return [
    "# Issue #1310 regression: does Jev still rank the stale claims first?",
    "",
    `${scored.length} of ${rows.length} claims answered (${stale} stale), models: ${models.length === 0 ? "none" : models.join(", ")}. AUC is the chance a current claim scores above a stale one; 0.5 is chance.`,
    ...(notAnswered === 0 ? [] : [`Not answered: ${notAnswered} (${reasons.join("; ")}).`]),
    "",
    "| feature | AUC |",
    "|---|---|",
    `| holds | ${figure(aucOf(scored, (s) => s.holds))} |`,
    `| 1 - contradicts | ${figure(aucOf(scored, (s) => 1 - s.contradicts))} |`,
    `| mean of both | ${figure(aucOf(scored, meanOf))} |`,
    "",
    `Per-issue average AUC of the mean: ${figure(per.average)} over ${per.issues} issues holding both verdicts.`,
    "",
    `Stale among the first N ranked by the mean (base rate ${baseRate}%): ${first}.`,
    "",
    "| band of the mean | rows | stale | current |",
    "|---|---|---|---|",
    ...BANDS.map((band) => {
      const inBand = scored.filter((s) => bandOf(meanOf(s)) === band);
      const staleIn = inBand.filter((s) => s.row.verdict === "stale").length;
      return `| ${band} | ${inBand.length} | ${staleIn} | ${inBand.length - staleIn} |`;
    }),
    "",
    TRIAL_REFERENCE,
  ];
};
