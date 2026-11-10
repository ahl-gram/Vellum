import { commentRuns } from "./collect.ts";
import type { Judged } from "./judge.ts";
import { YES, pinsId } from "./questions.ts";
import { modelsOf } from "./report.ts";
import type { TrialRow } from "./trial-set.ts";
import type { Tree } from "./tree.ts";
import type { CommentRun } from "./types.ts";

export type Scored = { readonly row: TrialRow; readonly judged: Judged };

export const locateRun = (tree: Tree, file: string, line: number): CommentRun | null =>
  commentRuns(file, tree.read(file)).find((run) => run.line <= line && line <= run.endLine) ?? null;

const KINDS = ["finding", "clear", "unsettled", "skipped"] as const;
const two = (n: number): string => n.toFixed(2);
const cell = (text: string): string => text.replaceAll("|", "\\|");
const where = (s: Scored): string => `${s.row.file}:${s.row.line}`;

const outcomeTable = (scored: readonly Scored[]): string[] => {
  const count = (kind: string, label: string): number =>
    scored.filter((s) => s.judged.outcome.kind === kind && s.row.label === label).length;
  return [
    "| outcome | removed by the sweep | kept by the sweep |",
    "|---|---|---|",
    ...KINDS.map((kind) => `| ${kind} | ${count(kind, "removed")} | ${count(kind, "kept")} |`),
  ];
};

const noulsOf = (judged: Judged): Record<string, number> =>
  Object.assign({}, ...judged.replies.map((r) => (r.ok ? r.nouls : {}))) as Record<string, number>;

type Named = { readonly scored: Scored; readonly found: boolean; readonly answer: number | null };

const namedOf = (scored: Scored): Named | null => {
  const named = scored.row.namedTest;
  if (named === null) return null;
  const index = scored.judged.candidates.findIndex((c) => c.file === named.file && c.name === named.name);
  const answer = index === -1 ? null : (noulsOf(scored.judged)[pinsId(index)] ?? null);
  return { scored, found: index !== -1, answer };
};

const everyComment = (scored: readonly Scored[]): string[] =>
  scored.map((s, i) => {
    const nouls = noulsOf(s.judged);
    const pins = s.judged.candidates.flatMap((c, index) => {
      const noul = nouls[pinsId(index)];
      return noul === undefined ? [] : [{ name: c.name, noul }];
    });
    const top = pins.reduce<(typeof pins)[number] | null>(
      (best, p) => (best === null || p.noul > best.noul ? p : best),
      null,
    );
    const restates = nouls.restates;
    return `| ${i + 1} | ${cell(where(s))} | ${s.row.label} | ${s.judged.run.ownLine ? "own line" : "trailing"} | ${s.judged.candidates.length} | ${s.judged.outcome.kind} | ${restates === undefined ? "none" : two(restates)} | ${top === null ? "none" : `${two(top.noul)} "${cell(top.name)}"`} |`;
  });

export const scoreLines = (scored: readonly Scored[]): string[] => {
  const judged = scored.map((s) => s.judged);
  const replies = judged.flatMap((j) => j.replies);
  const answered = replies.flatMap((r) => (r.ok ? [r] : []));
  const tokens = answered.reduce((sum, r) => sum + r.inputTokens, 0);
  const seconds = answered.reduce((sum, r) => sum + r.ms, 0) / 1000;
  const found = (label: string): number =>
    scored.filter((s) => s.judged.outcome.kind === "finding" && s.row.label === label).length;
  const removed = scored.filter((s) => s.row.label === "removed").length;
  const named = scored.flatMap((s) => {
    const n = namedOf(s);
    return n === null ? [] : [n];
  });
  const present = named.filter((n) => n.found);
  const answeredNamed = present.filter((n) => n.scored.judged.outcome.kind !== "skipped");
  return [
    "# Issue #1304: the comment trial",
    "",
    `${scored.length} comments; answered by ${modelsOf(judged)}; ${replies.length} requests sent, ${tokens} input tokens reported, ${seconds.toFixed(1)} seconds`,
    "",
    "## The pass against the sweeps",
    "",
    ...outcomeTable(scored),
    "",
    `findings on comments the sweep removed: ${found("removed")} of ${found("removed") + found("kept")}; removed comments the pass found: ${found("removed")} of ${removed}`,
    "",
    "### Own-line comments",
    "",
    ...outcomeTable(scored.filter((s) => s.judged.run.ownLine)),
    "",
    "### Trailing comments",
    "",
    ...outcomeTable(scored.filter((s) => !s.judged.run.ownLine)),
    "",
    "## The tests PR #548's ledger named",
    "",
    "| comment | named test among the candidates | its answer | the finding names it |",
    "|---|---|---|---|",
    ...named.map((n) => {
      const outcome = n.scored.judged.outcome;
      const answer = !n.found
        ? "none"
        : outcome.kind === "skipped"
          ? "skipped"
          : n.answer === null
            ? "none"
            : two(n.answer);
      const test = n.scored.row.namedTest!;
      const names =
        outcome.kind === "finding" && outcome.pinnedBy.some((p) => p.file === test.file && p.name === test.name);
      return `| ${cell(where(n.scored))} | ${n.found ? "yes" : "no"} | ${answer} | ${names ? "yes" : "no"} |`;
    }),
    "",
    `named test among the candidates: ${present.length} of ${named.length}; its answer above ${YES}: ${answeredNamed.filter((n) => n.answer !== null && n.answer > YES).length} of ${answeredNamed.length} answered`,
    "",
    "## Every comment",
    "",
    "| row | comment | label | place | candidates | outcome | restates | highest test answer |",
    "|---|---|---|---|---|---|---|---|",
    ...everyComment(scored),
  ];
};
