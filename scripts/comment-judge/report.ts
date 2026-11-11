import type { Reply, SystemOneRequest } from "../jev/system-one.ts";
import type { Judged } from "./judge.ts";
import type { CommentRun } from "./types.ts";

const at = (j: { readonly run: CommentRun }): string => `${j.run.file}:${j.run.line}`;
export const two = (n: number): string => n.toFixed(2);

export const modelsOf = (judged: readonly { readonly replies: readonly Reply[] }[]): string => {
  const models = new Set(judged.flatMap((j) => j.replies.flatMap((r) => (r.ok ? [r.model] : []))));
  return models.size === 0 ? "none" : [...models].join(", ");
};

const lineOf = (j: Judged): string => {
  const o = j.outcome;
  switch (o.kind) {
    case "finding": {
      const parts = o.pinnedBy.map((p) => `pinned by "${p.name}" in ${p.file} (${two(p.noul)})`);
      if (o.restates !== null) parts.push(`restates its code (${two(o.restates)})`);
      return `FINDING ${at(j)}: ${parts.join("; ")}`;
    }
    case "clear":
      return `clear ${at(j)}`;
    case "unsettled":
      return `unsettled ${at(j)}: highest answer ${two(o.highest)}`;
    case "skipped":
      return `SKIPPED ${at(j)}: ${o.reason}`;
  }
};

export const reportLines = (judged: readonly Judged[], dryRun: boolean): string[] => {
  if (dryRun) {
    const requests = judged.flatMap((j) => j.requests);
    const questions = requests.reduce((sum, r) => sum + Object.keys(r.questions).length, 0);
    const characters = requests.reduce((sum, r) => sum + JSON.stringify(r).length, 0);
    return [
      `dry run: ${judged.length} comments, ${requests.length} requests, ${questions} questions, ${characters} characters; nothing was sent`,
    ];
  }
  const count = (kind: string): number => judged.filter((j) => j.outcome.kind === kind).length;
  const skipped = count("skipped");
  const note = skipped > 0 ? " (a skipped comment is not judged, so no finding is claimed for it)" : "";
  return [
    `answered by ${modelsOf(judged)}`,
    ...judged.map(lineOf),
    `comment-judge: ${judged.length} comments; finding ${count("finding")}, clear ${count("clear")}, unsettled ${count("unsettled")}, skipped ${skipped}${note}`,
  ];
};

export const requestLines = (
  judged: readonly { readonly sha: string; readonly run: CommentRun; readonly requests: readonly SystemOneRequest[] }[],
): string[] =>
  judged.flatMap((j) =>
    j.requests.map((body, i) => JSON.stringify({ sha: j.sha, comment: at(j), request: i + 1, body })),
  );

export const replyLines = (
  judged: readonly { readonly sha: string; readonly run: CommentRun; readonly replies: readonly Reply[] }[],
): string[] =>
  judged.flatMap((j) =>
    j.replies.map((reply, i) => JSON.stringify({ sha: j.sha, comment: at(j), request: i + 1, reply })),
  );
