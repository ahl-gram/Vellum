import { two } from "../comment-judge/report.ts";
import type { Fn } from "./functions.ts";
import type { Found } from "./hunt.ts";
import { YES } from "./questions.ts";
import { loc } from "./report.ts";
import type { TrialRow, TrialSide } from "./trial-set.ts";

export const locate = (fns: readonly Fn[], sha: string, side: TrialSide): Fn => {
  const fn = fns.find((f) => f.file === side.file && f.line === side.line && f.name === side.name);
  if (fn === undefined) throw new Error(`${side.file}:${side.line} ${side.name} is not a function at ${sha}`);
  return fn;
};

export type Scored = { readonly row: TrialRow; readonly found: Found };

const readingOf = (row: TrialRow): string => (row.same ? "copy" : "different");

export const scoreLines = (scored: readonly Scored[]): string[] => {
  const answered = scored.flatMap((s) =>
    s.found.outcome.kind === "asked" ? [{ s, asked: s.found.outcome.asked }] : [],
  );
  const models = [
    ...new Set(scored.flatMap((s) => s.found.replies.flatMap((reply) => (reply.ok ? [reply.model] : [])))),
  ];
  const agree = answered.filter(({ s, asked }) => asked.mean > YES === s.row.same).length;
  const crossed = answered.filter(({ s, asked }) => asked.mean > YES !== s.row.then > YES).length;
  const same = scored.filter((s) => s.row.same).length;
  const reasons = [
    ...new Set(scored.flatMap((s) => (s.found.outcome.kind === "skipped" ? [s.found.outcome.reason] : []))),
  ];
  const skipped = scored.length - answered.length;
  return [
    "# Issue #1319 regression: does Jev still read the trial's pairs as the scan did?",
    "",
    `${answered.length} of ${scored.length} pairs answered, models: ${models.length === 0 ? "none" : models.join(", ")}. A pair is read as a copy when the mean of both orders is above ${YES}.`,
    `Agree with the reading: ${agree} of ${answered.length} answered (the set: ${same} copies, ${scored.length - same} different). Crossed ${YES} since the scan: ${crossed}.`,
    ...(skipped === 0 ? [] : [`Not answered: ${skipped} (${reasons.join("; ")}).`]),
    "",
    "| reading | then | now | a then b | b then a | agrees | a | b |",
    "|---|---|---|---|---|---|---|---|",
    ...scored.map(({ row, found }) => {
      const places = `${loc(found.x)} | ${loc(found.y)}`;
      const o = found.outcome;
      return o.kind === "asked"
        ? `| ${readingOf(row)} | ${two(row.then)} | ${two(o.asked.mean)} | ${two(o.asked.ab)} | ${two(o.asked.ba)} | ${o.asked.mean > YES === row.same ? "yes" : "no"} | ${places} |`
        : `| ${readingOf(row)} | ${two(row.then)} | skipped | - | - | - | ${places} |`;
    }),
  ];
};
