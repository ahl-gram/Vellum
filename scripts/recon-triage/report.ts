import { two } from "../comment-judge/report.ts";
import { MODEL, type Answered } from "../jev/system-one.ts";
import { bandOf } from "./questions.ts";
import type { Triaged } from "./triage.ts";

const cell = (text: string): string => text.replaceAll("|", "\\|").replaceAll("\n", " ");
const section = (title: string, lines: readonly string[]): string[] =>
  lines.length === 0 ? [] : ["", title, "", ...lines];

type Scored = { readonly t: Triaged; readonly answer: Answered; readonly score: number };

const answeredRows = (triaged: readonly Triaged[]): Scored[] =>
  triaged.flatMap((t) => (t.reply?.ok === true && t.score !== null ? [{ t, answer: t.reply, score: t.score }] : []));

const header = (sha: string, triaged: readonly Triaged[]): string => {
  const asked = triaged.filter((t) => t.route === "asked");
  const answered = answeredRows(triaged);
  const tokens = answered.reduce((sum, s) => sum + s.answer.inputTokens, 0);
  const skipped = asked.filter((t) => t.reply?.ok !== true).length;
  return `recon triage at ${sha} (${MODEL}): ${triaged.length} claims, ${asked.length} asked, ${answered.length} answered, ${skipped} skipped, ${tokens} input tokens`;
};

export const reportLines = (sha: string, triaged: readonly Triaged[]): string[] => {
  const noCode = triaged
    .filter((t) => t.route === "no code")
    .map((t) =>
      t.row.paths.length === 0
        ? `- ${t.row.claim} (${t.row.source}): cites no file`
        : `- ${t.row.claim} (${t.row.source}): not at ${sha}: ${(t.excerpt?.missingPaths ?? []).join(", ")}`,
    );
  const skipped = triaged.flatMap((t) =>
    t.route === "asked" && t.reply !== null && !t.reply.ok
      ? [`- ${t.row.claim} (${t.row.source}): ${t.reply.reason}`]
      : [],
  );
  const ranked = answeredRows(triaged)
    .sort((a, b) => a.score - b.score)
    .map((s, rank) => {
      const { holds, contradicts } = s.answer.nouls;
      const missing = s.t.excerpt?.missingSymbols ?? [];
      return `| ${rank + 1} | ${bandOf(s.score)} | ${two(s.score)} | ${two(holds!)} | ${two(contradicts!)} | ${cell(s.t.row.claim)} | ${cell(s.t.row.source)} | ${missing.length === 0 ? "none" : missing.join(", ")} |`;
    });
  const styles = triaged.filter((t) => t.route === "stylesheet").map((t) => `- ${t.row.claim} (${t.row.source})`);
  const commands = triaged
    .filter((t) => t.route === "command")
    .map((t) => `- [${t.row.kind}] ${t.row.claim} (${t.row.source})`);
  return [
    header(sha, triaged),
    ...section("## Check first: no code to read", noCode),
    ...section("## Triage skipped", skipped),
    ...section(
      "## Ranked, likely stale first",
      ranked.length === 0
        ? []
        : [
            "| rank | band | score | holds | contradicts | claim | source | symbols not found |",
            "|---|---|---|---|---|---|---|---|",
            ...ranked,
          ],
    ),
    ...section("## Not asked: every cited file is a stylesheet, so a browser read settles it", styles),
    ...section("## Not asked: a command settles it", commands),
  ];
};

export const requestLines = (triaged: readonly Triaged[]): string[] =>
  triaged.flatMap((t) =>
    t.request === null ? [] : [JSON.stringify({ claim: t.row.claim, source: t.row.source, request: t.request })],
  );

export const replyLines = (triaged: readonly Triaged[]): string[] =>
  triaged.flatMap((t) => (t.reply === null ? [] : [JSON.stringify({ claim: t.row.claim, reply: t.reply })]));
