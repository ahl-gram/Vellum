import type { Excerpt, Finding } from "./verify.ts";

export const NOT_READ = "the verifier reads TypeScript, JavaScript, sheets and pages only";

const side = (excerpt: Excerpt | null): string =>
  excerpt === null ? "the end of the file" : `line ${excerpt.line} ${JSON.stringify(excerpt.text)}`;

const findingLine = (f: Finding): string | null => {
  switch (f.kind) {
    case "identical":
      return null;
    case "prose":
      return `PROSE ${f.path}`;
    case "added":
      return `ADDED ${f.path}`;
    case "deleted":
      return `DELETED ${f.path}`;
    case "type changed":
      return `TYPE CHANGED ${f.path}`;
    case "mode changed":
      return null;
    case "not read":
      return `NOT READ ${f.path}: ${NOT_READ}`;
    case "renamed":
      return `RENAMED ${f.before} to ${f.path}`;
    case "differs":
      return `DIFFERS ${f.path}: base ${side(f.difference.base)}, head ${side(f.difference.head)}`;
  }
};

export const reportLines = (findings: readonly Finding[], from: string, head: string): string[] => {
  const count = (kind: Finding["kind"]): number => findings.filter((f) => f.kind === kind).length;
  return [
    `comment-sweep verify, read from ${from} to ${head}`,
    ...findings.flatMap((f) => findingLine(f) ?? []),
    `comment-sweep verify: ${findings.length} changed files; identical ${count("identical")}, differ ${count("differs")}, added ${count("added")}, deleted ${count("deleted")}, renamed ${count("renamed")}, type changed ${count("type changed")}, mode changed ${count("mode changed")}, not read ${count("not read")}, prose ${count("prose")}`,
  ];
};

export const exitOf = (findings: readonly Finding[]): 0 | 1 =>
  findings.every((f) => f.kind === "identical" || f.kind === "prose") ? 0 : 1;
