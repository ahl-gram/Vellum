import { two } from "../comment-judge/report.ts";
import type { Reply } from "../jev/system-one.ts";
import { COMPARISON_RULE } from "./compare.ts";
import { ASKED, NO, YES } from "./questions.ts";
import { RESTAGES, type Restage } from "./restage.ts";
import type { TrialStill } from "./trial-set.ts";

// Alex, 2026-11-11, Issue #1309 (https://github.com/ahl-gram/Vellum/issues/1309#issuecomment-6804409144): a question is kept when today's chart wins at least 24 of 30 pairs of its own mistake and at most 7 in 10 of any other.
export const KEEP_RATE = 0.8;
export const OFF_TARGET_MAX = 0.7;
export type Pair = { readonly clean: number; readonly restaged: number };

export const winRate = (pairs: readonly Pair[]): number =>
  pairs.length === 0
    ? NaN
    : pairs.reduce((n, p) => n + (p.clean > p.restaged ? 1 : p.clean === p.restaged ? 0.5 : 0), 0) / pairs.length;

const figure = (n: number): string => (Number.isNaN(n) ? "n/a" : two(n));

export const pairsOf = (
  seeds: readonly number[],
  asked: readonly TrialStill[],
  replies: readonly Reply[],
  r: Restage,
  question: string,
): Pair[] => {
  const answerOf = (seed: number, arm: TrialStill["arm"]): number | null => {
    const reply = replies[asked.findIndex((s) => s.seed === seed && s.kind === r.kind && s.arm === arm)];
    return reply !== undefined && reply.ok ? (reply.nouls[question] ?? null) : null;
  };
  return seeds.flatMap((seed) => {
    const clean = answerOf(seed, "clean");
    const restaged = answerOf(seed, r.id);
    return clean === null || restaged === null ? [] : [{ clean, restaged }];
  });
};

export const scoreLines = (
  seeds: readonly number[],
  asked: readonly TrialStill[],
  replies: readonly Reply[],
  stills: number,
): string[] => {
  const answered = replies.filter((r) => r.ok);
  const failed = replies.filter((r): r is { ok: false; reason: string } => !r.ok);
  const tokens = answered.reduce((n, r) => n + r.inputTokens, 0);
  const models = [...new Set(answered.map((r) => r.model))];
  const reasons = [...new Set(failed.map((r) => r.reason))];
  const reaskDiffs = asked.slice(stills).flatMap((s, k) => {
    const first = replies[asked.findIndex((x) => x.seed === s.seed && x.kind === s.kind && x.arm === s.arm)];
    const again = replies[stills + k];
    if (first === undefined || again === undefined || !first.ok || !again.ok) return [];
    return Object.keys(first.nouls).map((q) => Math.abs(first.nouls[q]! - (again.nouls[q] ?? NaN)));
  });
  const pairs = (r: Restage, q: string): Pair[] => pairsOf(seeds, asked, replies, r, q);
  return [
    "# Issue #1309 trial: does Jev rate today's chart above its restaged twin?",
    "",
    `${asked.length} requests built (${stills} stills over ${seeds.length} seeds, ${asked.length - stills} re-asked), ${answered.length} answered, ${failed.length} not answered, ${tokens} input tokens reported, models: ${models.length === 0 ? "none" : models.join(", ")}.`,
    ...(failed.length === 0 ? [] : [`Not answered: ${failed.length} (${reasons.join("; ")}).`]),
    "",
    `A pair is won when today's chart reads higher than its restaged twin on the defect's own question, half won on a tie; 0.5 is chance. Kept: every pair answered, at least ${KEEP_RATE} of them won, and at most ${OFF_TARGET_MAX} won where the same question is asked of another defect.`,
    "",
    "| defect | issue | question | pairs | won | won elsewhere | today above 0.7 | restaged below 0.3 | kept |",
    "|---|---|---|---|---|---|---|---|---|",
    ...RESTAGES.map((r) => {
      const own = pairs(r, r.question);
      const rate = winRate(own);
      const others = RESTAGES.filter((o) => o.id !== r.id && ASKED[o.kind].includes(r.question));
      const rates = others.map((o) => winRate(pairs(o, r.question))).filter((x) => !Number.isNaN(x));
      const elsewhere = others.length === 0 ? "-" : figure(rates.length === 0 ? NaN : Math.max(...rates));
      const kept =
        own.length === 0
          ? "-"
          : own.length === seeds.length && rate >= KEEP_RATE && rates.every((x) => x <= OFF_TARGET_MAX)
            ? "yes"
            : "no";
      return `| ${r.id} | #${r.issue} | ${r.question} | ${own.length} | ${figure(rate)} | ${elsewhere} | ${own.filter((p) => p.clean > YES).length} | ${own.filter((p) => p.restaged < NO).length} | ${kept} |`;
    }),
    "",
    "Off target: each restaged still's other questions, which a defect not about them should leave near 0.5.",
    "",
    "| defect | question | pairs | won |",
    "|---|---|---|---|",
    ...RESTAGES.flatMap((r) =>
      ASKED[r.kind]
        .filter((q) => q !== r.question)
        .map((q) => {
          const off = pairs(r, q);
          return `| ${r.id} | ${q} | ${off.length} | ${figure(winRate(off))} |`;
        }),
    ),
    "",
    `Re-asked: ${reaskDiffs.length} answers compared, largest difference ${reaskDiffs.length === 0 ? "n/a" : two(Math.max(...reaskDiffs))}.`,
    "",
    COMPARISON_RULE,
  ];
};
