import { Linter, type Rule } from "eslint";
import type { Comment, Program } from "estree";
import { join, resolve } from "node:path";
import tseslint from "typescript-eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");

export type TsParse = { readonly text: string; readonly program: Program; readonly comments: readonly Comment[] };

export const parseTs = (path: string, text: string): TsParse => {
  let kept: { program: Program; comments: Comment[] } | undefined;
  const read: Rule.RuleModule = {
    meta: { type: "problem", schema: [] },
    create(context) {
      return {
        Program(node) {
          kept = { program: node, comments: context.sourceCode.getAllComments() };
        },
      };
    },
  };
  const messages = new Linter({ cwd: ROOT }).verify(
    text,
    [
      {
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { judge: { rules: { read } } },
        rules: { "judge/read": "error" },
      },
    ],
    { filename: join(ROOT, path) },
  );
  const fatal = messages.find((m) => m.fatal);
  if (fatal) throw new Error(`${path} does not parse: ${fatal.message}`);
  if (!kept) throw new Error(`${path} was not read`);
  return { text, program: kept.program, comments: kept.comments };
};

export const blankComments = (text: string, comments: readonly Comment[]): string => {
  let out = "";
  let at = 0;
  for (const c of [...comments].sort((a, b) => a.range![0] - b.range![0])) {
    const [from, to] = c.range!;
    out += text.slice(at, from) + text.slice(from, to).replace(/[^\n]/g, " ");
    at = to;
  }
  return out + text.slice(at);
};

export const withoutComments = (text: string, from: number, to: number, comments: readonly Comment[]): string => {
  let out = "";
  let at = from;
  for (const c of [...comments].sort((a, b) => a.range![0] - b.range![0])) {
    const [start, end] = c.range!;
    if (start < from || end > to) continue;
    out += text.slice(at, start);
    at = end;
  }
  out += text.slice(at, to);
  return out
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line !== "")
    .join("\n");
};
