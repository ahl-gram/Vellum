import { replyLines, requestLines } from "../comment-judge/report.ts";
import { changedFiles, deletedFiles, gitTree, mergeBase, revParse } from "../comment-judge/tree.ts";
import { parseArgs, sendFor, writeAll, type Args } from "../jev/cli.ts";
import { deletedRuns, filesToRead } from "./collect.ts";
import { reportLines } from "./report.ts";
import { RUN_INPUT_TOKEN_CAP, scanAll } from "./scan.ts";

const USAGE = "usage: npm run keeper-scan -- diff <base> <head> [--dry-run] [--out <dir>]";

const diff = async (repo: string, base: string, head: string, args: Args): Promise<number> => {
  const sha = revParse(repo, head);
  const from = mergeBase(repo, base, sha);
  const before = gitTree(repo, from);
  const after = gitTree(repo, sha);
  const { read, notRead } = filesToRead(changedFiles(repo, from, sha), deletedFiles(repo, from, sha));
  const items = read.flatMap((c) => {
    const fileAfter = after.read(c.path);
    return deletedRuns(c.path, before.read(c.before!), fileAfter).map((run) => ({ sha: from, run, fileAfter }));
  });
  const scanned = await scanAll(items, sendFor(args.dryRun), RUN_INPUT_TOKEN_CAP);
  console.log(reportLines(scanned, notRead, { base: from, head: sha }, args.dryRun).join("\n"));
  if (args.out !== null)
    writeAll(args.out, { "requests.jsonl": requestLines(scanned), "replies.jsonl": replyLines(scanned) });
  return !args.dryRun && scanned.some((s) => s.outcome.kind === "skipped") ? 1 : 0;
};

export const main = async (argv: readonly string[]): Promise<number> => {
  const args = parseArgs(argv);
  const [command, ...rest] = args?.positional ?? [];
  if (args !== null && command === "diff" && rest.length === 2) return diff(process.cwd(), rest[0]!, rest[1]!, args);
  console.error(USAGE);
  return 2;
};

if (import.meta.main) {
  process.exitCode = await main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  });
}
