import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { noteText, ownLineAt, runs, type Note } from "../lint/comment-notes.ts";
import { blankComments, parseTs } from "./parse.ts";
import type { CommentRun } from "./types.ts";

export const CODE_LINES = 5;

export const isJudged = (path: string): boolean => path.endsWith(".ts") && lintTsRoots().includes(path.split("/")[0]!);

type Placed = Note & { readonly range: readonly [number, number] };

const codeBeside = (lines: readonly string[], run: readonly Placed[]): string => {
  const first = run[0]!;
  if (!first.ownLine) return lines[first.loc.start.line - 1]!.trimEnd();
  const after = lines.slice(run.at(-1)!.loc.end.line);
  const start = after.findIndex((line) => line.trim() !== "");
  if (start === -1) return "";
  const rest = after.slice(start);
  const stop = rest.findIndex((line) => line.trim() === "");
  return rest
    .slice(0, stop === -1 ? undefined : stop)
    .slice(0, CODE_LINES)
    .map((line) => line.trimEnd())
    .join("\n");
};

export const commentRuns = (path: string, text: string): CommentRun[] => {
  const parsed = parseTs(path, text);
  const notes = parsed.comments.map((c): Placed => ({
    text: noteText(c.value, c.type === "Block"),
    ownLine: ownLineAt(text, c.range![0]),
    loc: c.loc!,
    range: c.range!,
  }));
  const lines = blankComments(text, parsed.comments).split("\n");
  return runs(notes).map((run) => ({
    file: path,
    line: run[0]!.loc.start.line,
    endLine: run.at(-1)!.loc.end.line,
    start: run[0]!.range[0],
    end: run.at(-1)!.range[1],
    text: run.map((n) => n.text).join(" "),
    ownLine: run[0]!.ownLine,
    code: codeBeside(lines, run),
  }));
};

export const addedRuns = (path: string, before: string | null, after: string): CommentRun[] => {
  const all = commentRuns(path, after);
  if (before === null) return all;
  const carried = new Set(commentRuns(path, before).map((r) => r.text));
  return all.filter((r) => !carried.has(r.text));
};
