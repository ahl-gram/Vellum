import { modelsOf, two } from "../comment-judge/report.ts";
import type { NotRead } from "./collect.ts";
import type { Scanned } from "./scan.ts";

export type At = { readonly base: string; readonly head: string };

export const reportLines = (
  scanned: readonly Scanned[],
  notRead: readonly NotRead[],
  at: At,
  dryRun: boolean,
): string[] => {
  const notReadLines = notRead.map((n) => `NOT READ ${n.path}: ${n.reason}`);
  if (dryRun) {
    const requests = scanned.flatMap((s) => s.requests);
    const questions = requests.reduce((sum, r) => sum + Object.keys(r.questions).length, 0);
    const characters = requests.reduce((sum, r) => sum + JSON.stringify(r).length, 0);
    return [
      ...notReadLines,
      `dry run: ${scanned.length} deleted comments, ${requests.length} keeper requests, ${questions} questions, ${characters} characters; the survival questions follow the keeper answers, so none was built; nothing was sent`,
    ];
  }
  const listed = (["lost", "unsettled"] as const).flatMap((band) =>
    scanned.flatMap((s) =>
      s.outcome.kind === "read" && s.outcome.band === band
        ? [
            `${band.toUpperCase()} ${s.run.file}:${s.run.line}: ${s.outcome.signals.map((r) => `${r.signal} (keeper ${two(r.keeper)}, survival ${two(r.survival)})`).join("; ")}`,
            `  > ${s.run.text}`,
          ]
        : [],
    ),
  );
  const skipped = scanned.flatMap((s) =>
    s.outcome.kind === "skipped"
      ? [`SKIPPED ${s.run.file}:${s.run.line}: ${s.outcome.reason}`, `  > ${s.run.text}`]
      : [],
  );
  const tally = scanned.reduce<Readonly<Record<string, number>>>((counts, s) => {
    const key = s.outcome.kind === "read" ? s.outcome.band : "skipped";
    return { ...counts, [key]: (counts[key] ?? 0) + 1 };
  }, {});
  const note = (tally.skipped ?? 0) > 0 ? " (a skipped comment was not read, so it is scanned by hand)" : "";
  return [
    `deleted comments read at ${at.base}, their files at ${at.head}; answered by ${modelsOf(scanned)}`,
    ...listed,
    ...skipped,
    ...notReadLines,
    `keeper-scan: ${scanned.length} deleted comments; lost ${tally.lost ?? 0}, unsettled ${tally.unsettled ?? 0}, still said ${tally.said ?? 0}, unsure ${tally.unsure ?? 0} (not listed), no signal ${tally.clear ?? 0}, skipped ${tally.skipped ?? 0}${note}; files not read ${notRead.length}`,
  ];
};
