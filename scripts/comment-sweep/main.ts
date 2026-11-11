import { changedFiles, deletedFiles, gitTree, mergeBase, revParse, typeChangedFiles } from "../comment-judge/tree.ts";
import { exitOf, reportLines } from "./report.ts";
import { findingsOf } from "./verify.ts";

const USAGE = "usage: npm run comment-sweep -- verify <base> <head>";

export const verify = (
  repo: string,
  base: string,
  head: string,
): { readonly lines: readonly string[]; readonly code: 0 | 1 } => {
  const sha = revParse(repo, head);
  const from = mergeBase(repo, base, sha);
  const findings = findingsOf(
    changedFiles(repo, from, sha),
    deletedFiles(repo, from, sha),
    typeChangedFiles(repo, from, sha),
    gitTree(repo, from),
    gitTree(repo, sha),
  );
  return { lines: reportLines(findings, from, sha), code: exitOf(findings) };
};

export const main = (argv: readonly string[], repo = process.cwd()): number => {
  const [command, ...rest] = argv;
  if (command !== "verify" || rest.length !== 2 || rest.some((arg) => arg.startsWith("-"))) {
    console.error(USAGE);
    return 2;
  }
  const { lines, code } = verify(repo, rest[0]!, rest[1]!);
  console.log(lines.join("\n"));
  return code;
};

if (import.meta.main) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
